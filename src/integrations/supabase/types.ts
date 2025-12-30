export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_records: {
        Row: {
          certificate_id: string | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          grade: number | null
          id: string
          notes: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_id?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          grade?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_id?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          grade?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_records_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_leads: {
        Row: {
          assigned_to: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string
          how_found_us: string | null
          id: string
          interest_course: string | null
          last_contact_at: string | null
          notes: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name: string
          how_found_us?: string | null
          id?: string
          interest_course?: string | null
          last_contact_at?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          how_found_us?: string | null
          id?: string
          interest_course?: string | null
          last_contact_at?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bible_bookmarks: {
        Row: {
          book_abbrev: string
          chapter: number
          created_at: string
          id: string
          user_id: string
          verse: number
          verse_id: string
          verse_text: string | null
        }
        Insert: {
          book_abbrev: string
          chapter: number
          created_at?: string
          id?: string
          user_id: string
          verse: number
          verse_id: string
          verse_text?: string | null
        }
        Update: {
          book_abbrev?: string
          chapter?: number
          created_at?: string
          id?: string
          user_id?: string
          verse?: number
          verse_id?: string
          verse_text?: string | null
        }
        Relationships: []
      }
      bible_notes: {
        Row: {
          book_abbrev: string
          chapter: number
          created_at: string
          id: string
          note: string
          updated_at: string
          user_id: string
          verse: number
          verse_id: string
        }
        Insert: {
          book_abbrev: string
          chapter: number
          created_at?: string
          id?: string
          note: string
          updated_at?: string
          user_id: string
          verse: number
          verse_id: string
        }
        Update: {
          book_abbrev?: string
          chapter?: number
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
          user_id?: string
          verse?: number
          verse_id?: string
        }
        Relationships: []
      }
      bible_studies: {
        Row: {
          book_abbrev: string
          chapter: number | null
          content: string
          created_at: string | null
          id: string
          study_type: string
          title: string
          verse: number | null
        }
        Insert: {
          book_abbrev: string
          chapter?: number | null
          content: string
          created_at?: string | null
          id?: string
          study_type?: string
          title: string
          verse?: number | null
        }
        Update: {
          book_abbrev?: string
          chapter?: number | null
          content?: string
          created_at?: string | null
          id?: string
          study_type?: string
          title?: string
          verse?: number | null
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          book_abbrev: string
          book_name: string
          chapter: number
          created_at: string | null
          id: string
          text: string
          translation: string
          verse: number
        }
        Insert: {
          book_abbrev: string
          book_name: string
          chapter: number
          created_at?: string | null
          id?: string
          text: string
          translation: string
          verse: number
        }
        Update: {
          book_abbrev?: string
          book_name?: string
          chapter?: number
          created_at?: string | null
          id?: string
          text?: string
          translation?: string
          verse?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          course_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          id: string
          is_public: boolean | null
          start_time: string
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_public?: boolean | null
          start_time: string
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_public?: boolean | null
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          id: string
          issued_at: string | null
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_plans: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          installments: number | null
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          installments?: number | null
          is_active?: boolean | null
          name: string
          price?: number
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          installments?: number | null
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_plans_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          instructor: string | null
          is_published: boolean | null
          level: string | null
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor?: string | null
          is_published?: boolean | null
          level?: string | null
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor?: string | null
          is_published?: boolean | null
          level?: string | null
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      devotional_interactions: {
        Row: {
          created_at: string | null
          devotional_id: string
          id: string
          is_bookmarked: boolean | null
          is_liked: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          devotional_id: string
          id?: string
          is_bookmarked?: boolean | null
          is_liked?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          devotional_id?: string
          id?: string
          is_bookmarked?: boolean | null
          is_liked?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_interactions_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_notes: {
        Row: {
          created_at: string | null
          devotional_id: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          devotional_id: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          devotional_id?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_notes_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_read_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_read_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_read_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          created_at: string | null
          id: string
          prayer: string | null
          publish_date: string
          reflection: string
          title: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prayer?: string | null
          publish_date: string
          reflection: string
          title: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prayer?: string | null
          publish_date?: string
          reflection?: string
          title?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          is_anonymous: boolean | null
          is_recurring: boolean | null
          message: string | null
          payment_method: string | null
          recurrence_type: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_recurring?: boolean | null
          message?: string | null
          payment_method?: string | null
          recurrence_type?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_recurring?: boolean | null
          message?: string | null
          payment_method?: string | null
          recurrence_type?: string | null
          status?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          reference: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          reference?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          reference?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "course_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_solution: boolean | null
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_solution?: boolean | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          content: string
          course_id: string | null
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          lesson_id: string | null
          replies_count: number | null
          title: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          lesson_id?: string | null
          replies_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          lesson_id?: string | null
          replies_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          order_index: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      library_materials: {
        Row: {
          category: string | null
          content: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_published: boolean | null
          title: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          course_type: string | null
          created_at: string | null
          enrollment_date: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          course_type?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          course_type?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          id: string
          is_correct: boolean | null
          option_text: string
          order_index: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          option_text: string
          order_index: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          option_text?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          points: number | null
          question_text: string
          question_type: string | null
          quiz_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index: number
          points?: number | null
          question_text: string
          question_type?: string | null
          quiz_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          points?: number | null
          question_text?: string
          question_type?: string | null
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          lesson_id: string | null
          passing_score: number | null
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      strongs_translations: {
        Row: {
          created_at: string | null
          original_word: string | null
          part_of_speech: string | null
          portuguese_definition: string
          portuguese_usage: string | null
          portuguese_word: string
          strongs_id: string
          transliteration: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          original_word?: string | null
          part_of_speech?: string | null
          portuguese_definition: string
          portuguese_usage?: string | null
          portuguese_word: string
          strongs_id: string
          transliteration?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          original_word?: string | null
          part_of_speech?: string | null
          portuguese_definition?: string
          portuguese_usage?: string | null
          portuguese_word?: string
          strongs_id?: string
          transliteration?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          course_id: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lesson_id: string | null
          session_date: string
          started_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lesson_id?: string | null
          session_date?: string
          started_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lesson_id?: string | null
          session_date?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          font_size: string | null
          id: string
          language: string | null
          message_notifications: boolean | null
          new_course_notifications: boolean | null
          push_notifications: boolean | null
          reminder_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          id?: string
          language?: string | null
          message_notifications?: boolean | null
          new_course_notifications?: boolean | null
          push_notifications?: boolean | null
          reminder_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          id?: string
          language?: string | null
          message_notifications?: boolean | null
          new_course_notifications?: boolean | null
          push_notifications?: boolean | null
          reminder_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "instructor", "student"],
    },
  },
} as const
