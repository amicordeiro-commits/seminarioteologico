import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Order matters for foreign key constraints
// Order matters for foreign key constraints
const RESTORE_ORDER = [
  'profiles',
  'user_roles',
  'user_settings',
  'courses',
  'lessons',
  'course_plans',
  'enrollments',
  'lesson_progress',
  'quizzes',
  'quiz_questions',
  'quiz_options',
  'quiz_attempts',
  'quiz_recovery_settings',
  'certificates',
  'academic_records',
  'library_materials',
  'blog_posts',
  'calendar_events',
  'messages',
  'forum_topics',
  'forum_replies',
  'devotionals',
  'devotional_interactions',
  'devotional_notes',
  'devotional_streaks',
  'bible_bookmarks',
  'bible_notes',
  'bible_studies',
  'donations',
  'financial_transactions',
  'admission_leads',
  'strongs_translations',
  'study_sessions',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client with user auth for RLS check
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user and verify admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData } = await supabaseUser.from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error('Only admins can restore backups');
    }

    const { backupId, clearExisting } = await req.json();

    if (!backupId) {
      throw new Error('Backup ID is required');
    }

    // Service client for data operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get backup record
    const { data: backup, error: backupError } = await supabaseAdmin
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (backupError || !backup) {
      throw new Error('Backup not found');
    }

    console.log('Starting restore from:', backup.file_name);

    // Download backup file
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('backups')
      .download(backup.file_name);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download backup: ${downloadError?.message}`);
    }

    // Parse backup content
    const backupContent = JSON.parse(await fileData.text());
    const { data: backupDataContent } = backupContent;

    const restoredCounts: Record<string, number> = {};
    const errors: string[] = [];

    // Restore tables in order
    for (const table of RESTORE_ORDER) {
      if (!backupDataContent[table] || backupDataContent[table].length === 0) {
        console.log(`Skipping empty table: ${table}`);
        restoredCounts[table] = 0;
        continue;
      }

      console.log(`Restoring table: ${table} (${backupDataContent[table].length} records)`);

      try {
        // Clear existing data if requested (in reverse order for FK constraints)
        if (clearExisting) {
          const { error: deleteError } = await supabaseAdmin
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

          if (deleteError) {
            console.warn(`Could not clear ${table}:`, deleteError.message);
          }
        }

        // Insert data in batches
        const batchSize = 100;
        const records = backupDataContent[table];
        let insertedCount = 0;

        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          
          const { error: insertError } = await supabaseAdmin
            .from(table)
            .upsert(batch, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          if (insertError) {
            console.error(`Error restoring ${table} batch:`, insertError);
            errors.push(`${table}: ${insertError.message}`);
          } else {
            insertedCount += batch.length;
          }
        }

        restoredCounts[table] = insertedCount;
      } catch (tableError: unknown) {
        console.error(`Error restoring ${table}:`, tableError);
        const message = tableError instanceof Error ? tableError.message : 'Unknown error';
        errors.push(`${table}: ${message}`);
        restoredCounts[table] = 0;
      }
    }

    const totalRestored = Object.values(restoredCounts).reduce((a, b) => a + b, 0);

    console.log('Restore completed. Total records:', totalRestored);

    return new Response(
      JSON.stringify({
        success: true,
        restoredCounts,
        totalRestored,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Restore error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
