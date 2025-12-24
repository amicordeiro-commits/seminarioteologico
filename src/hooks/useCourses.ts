import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string | null;
  thumbnail_url: string | null;
  category: string;
  duration_hours: number;
  total_lessons: number;
  level: string;
  is_published: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percent: number;
  course?: Course;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watched_seconds: number;
  completed_at: string | null;
}

// Fetch all courses
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Course[];
    },
  });
};

// Fetch single course with lessons
export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();
      
      if (courseError) throw courseError;
      if (!course) return null;

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (lessonsError) throw lessonsError;

      return { ...course, lessons: lessons as Lesson[] } as Course & { lessons: Lesson[] };
    },
    enabled: !!courseId,
  });
};

// Fetch user enrollments
export const useEnrollments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as (Enrollment & { course: Course })[];
    },
    enabled: !!user,
  });
};

// Check if enrolled in course
export const useEnrollment = (courseId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Enrollment | null;
    },
    enabled: !!user && !!courseId,
  });
};

// Enroll in course
export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment'] });
    },
  });
};

// Fetch lesson progress for a course
export const useLessonProgress = (courseId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['lesson-progress', courseId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
      
      if (!lessons || lessons.length === 0) return [];
      
      const lessonIds = lessons.map(l => l.id);
      
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user && !!courseId,
  });
};

// Mark lesson as complete
export const useMarkLessonComplete = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, courseId }: { lessonId: string; courseId: string }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update enrollment progress
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);

      if (lessons) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', true)
          .in('lesson_id', lessons.map(l => l.id));

        const progressPercent = Math.round(((progress?.length || 0) / lessons.length) * 100);
        
        await supabase
          .from('enrollments')
          .update({ 
            progress_percent: progressPercent,
            completed_at: progressPercent === 100 ? new Date().toISOString() : null
          })
          .eq('user_id', user.id)
          .eq('course_id', courseId);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
};
