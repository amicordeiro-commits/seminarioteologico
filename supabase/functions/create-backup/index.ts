import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tables to backup
const TABLES_TO_BACKUP = [
  'profiles',
  'user_roles',
  'user_settings',
  'courses',
  'lessons',
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
  'course_plans',
  'admission_leads',
  'strongs_translations',
  'study_sessions',
  'backups',
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
      throw new Error('Only admins can create backups');
    }

    // Service client for data export
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { notes } = await req.json().catch(() => ({}));

    console.log('Starting backup creation...');

    // Export all tables
    const backupData: Record<string, unknown[]> = {};
    const recordsCounts: Record<string, number> = {};

    for (const table of TABLES_TO_BACKUP) {
      console.log(`Exporting table: ${table}`);
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`Error exporting ${table}:`, error);
        backupData[table] = [];
        recordsCounts[table] = 0;
      } else {
        backupData[table] = data || [];
        recordsCounts[table] = data?.length || 0;
      }
    }

    // Create JSON content
    const backupContent = JSON.stringify({
      version: '1.0',
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      tables: TABLES_TO_BACKUP,
      data: backupData
    }, null, 2);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.json`;

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('backups')
      .upload(fileName, backupContent, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // Get file URL
    const { data: urlData } = supabaseAdmin.storage
      .from('backups')
      .getPublicUrl(fileName);

    // Record backup in database
    const { data: backupRecord, error: recordError } = await supabaseAdmin
      .from('backups')
      .insert({
        file_name: fileName,
        file_url: urlData.publicUrl,
        file_size: new Blob([backupContent]).size,
        tables_included: TABLES_TO_BACKUP,
        records_count: recordsCounts,
        created_by: user.id,
        notes: notes || null
      })
      .select()
      .single();

    if (recordError) {
      console.error('Record error:', recordError);
      throw new Error(`Failed to record backup: ${recordError.message}`);
    }

    console.log('Backup created successfully:', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        backup: backupRecord,
        totalRecords: Object.values(recordsCounts).reduce((a, b) => a + b, 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Backup error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
