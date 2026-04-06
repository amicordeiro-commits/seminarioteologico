import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Flame, BookOpen, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudyStreakWidget() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["study-streak-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get study sessions from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("session_date, duration_seconds")
        .eq("user_id", user.id)
        .gte("session_date", sevenDaysAgo.toISOString().split("T")[0])
        .order("session_date", { ascending: false });

      // Get devotional streak
      const { data: streak } = await supabase
        .from("devotional_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();

      // Get completed lessons count
      const { count: completedLessons } = await supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true);

      const totalMinutes = (sessions || []).reduce(
        (acc, s) => acc + (s.duration_seconds || 0) / 60, 0
      );

      const daysStudied = new Set((sessions || []).map(s => s.session_date)).size;

      return {
        totalMinutesWeek: Math.round(totalMinutes),
        daysStudiedWeek: daysStudied,
        devotionalStreak: streak?.current_streak || 0,
        completedLessons: completedLessons || 0,
      };
    },
    enabled: !!user?.id,
  });

  if (!stats) return null;

  const items = [
    { icon: Flame, label: "Devocional", value: `${stats.devotionalStreak}d`, color: "text-orange-500 bg-orange-500/10" },
    { icon: BookOpen, label: "Aulas", value: stats.completedLessons, color: "text-primary bg-primary/10" },
    { icon: Target, label: "Dias/sem", value: `${stats.daysStudiedWeek}/7`, color: "text-accent bg-accent/10" },
    { icon: TrendingUp, label: "Min/sem", value: `${stats.totalMinutesWeek}`, color: "text-green-500 bg-green-500/10" },
  ];

  return (
    <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-card border border-border">
      <h3 className="font-serif font-semibold text-foreground text-sm sm:text-base mb-3">
        Meu Progresso
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-background">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.color)}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-foreground leading-tight">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
