import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface RecoverySettings {
  id: string;
  quiz_id: string;
  allow_recovery: boolean;
  max_recovery_attempts: number;
  recovery_passing_score: number;
  wait_hours_before_recovery: number;
}

interface RecoveryAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  passed: boolean | null;
  is_recovery: boolean;
  recovery_count: number;
  completed_at: string | null;
  started_at: string | null;
}

export function useQuizRecovery(quizId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch recovery settings for a quiz
  const { data: recoverySettings, isLoading: loadingSettings } = useQuery({
    queryKey: ["quiz-recovery-settings", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      
      const { data, error } = await supabase
        .from("quiz_recovery_settings")
        .select("*")
        .eq("quiz_id", quizId)
        .maybeSingle();
      
      if (error) throw error;
      return data as RecoverySettings | null;
    },
    enabled: !!quizId
  });

  // Fetch user's attempts for a quiz
  const { data: userAttempts, isLoading: loadingAttempts } = useQuery({
    queryKey: ["quiz-attempts", quizId, user?.id],
    queryFn: async () => {
      if (!quizId || !user?.id) return [];
      
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data as RecoveryAttempt[];
    },
    enabled: !!quizId && !!user?.id
  });

  // Calculate if user can take recovery
  const canTakeRecovery = (): { allowed: boolean; reason?: string } => {
    if (!recoverySettings?.allow_recovery) {
      return { allowed: false, reason: "Recuperação não habilitada para este quiz" };
    }

    if (!userAttempts || userAttempts.length === 0) {
      return { allowed: false, reason: "Você precisa fazer a prova primeiro" };
    }

    // Check if user already passed
    const passedAttempt = userAttempts.find(a => a.passed === true);
    if (passedAttempt) {
      return { allowed: false, reason: "Você já foi aprovado neste quiz" };
    }

    // Count recovery attempts
    const recoveryAttempts = userAttempts.filter(a => a.is_recovery === true);
    if (recoveryAttempts.length >= recoverySettings.max_recovery_attempts) {
      return { allowed: false, reason: `Limite de ${recoverySettings.max_recovery_attempts} recuperações atingido` };
    }

    // Check wait time
    const lastAttempt = userAttempts[0];
    if (lastAttempt?.completed_at) {
      const lastAttemptDate = new Date(lastAttempt.completed_at);
      const waitUntil = new Date(lastAttemptDate.getTime() + recoverySettings.wait_hours_before_recovery * 60 * 60 * 1000);
      
      if (new Date() < waitUntil) {
        const hoursRemaining = Math.ceil((waitUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60));
        return { allowed: false, reason: `Aguarde ${hoursRemaining}h para nova tentativa` };
      }
    }

    return { allowed: true };
  };

  // Save recovery settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<RecoverySettings> & { quiz_id: string }) => {
      const { data, error } = await supabase
        .from("quiz_recovery_settings")
        .upsert({
          quiz_id: settings.quiz_id,
          allow_recovery: settings.allow_recovery ?? true,
          max_recovery_attempts: settings.max_recovery_attempts ?? 2,
          recovery_passing_score: settings.recovery_passing_score ?? 60,
          wait_hours_before_recovery: settings.wait_hours_before_recovery ?? 24
        }, { onConflict: "quiz_id" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-recovery-settings"] });
    }
  });

  // Start recovery attempt
  const startRecoveryMutation = useMutation({
    mutationFn: async (originalAttemptId: string) => {
      if (!user?.id || !quizId) throw new Error("Usuário ou quiz não identificado");

      const recoveryCheck = canTakeRecovery();
      if (!recoveryCheck.allowed) {
        throw new Error(recoveryCheck.reason);
      }

      const recoveryCount = (userAttempts?.filter(a => a.is_recovery)?.length || 0) + 1;

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          is_recovery: true,
          original_attempt_id: originalAttemptId,
          recovery_count: recoveryCount,
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    }
  });

  // Get original failed attempt
  const getOriginalFailedAttempt = () => {
    if (!userAttempts) return null;
    return userAttempts.find(a => !a.is_recovery && a.passed === false && a.completed_at);
  };

  return {
    recoverySettings,
    userAttempts,
    loadingSettings,
    loadingAttempts,
    canTakeRecovery,
    saveSettings: saveSettingsMutation.mutate,
    savingSettings: saveSettingsMutation.isPending,
    startRecovery: startRecoveryMutation.mutateAsync,
    startingRecovery: startRecoveryMutation.isPending,
    getOriginalFailedAttempt
  };
}
