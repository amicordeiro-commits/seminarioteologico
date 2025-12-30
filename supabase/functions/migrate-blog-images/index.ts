import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all blog posts with base64 images
    const { data: posts, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, featured_image")
      .like("featured_image", "data:%");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No base64 images found to migrate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${posts.length} posts with base64 images`);
    const results: { postId: string; success: boolean; imageUrl?: string; error?: string }[] = [];

    for (const post of posts) {
      try {
        const base64Image = post.featured_image;
        
        // Extract the base64 data and mime type
        const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          results.push({ postId: post.id, success: false, error: "Invalid base64 format" });
          continue;
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split("/")[1] || "png";

        // Convert base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Upload to storage
        const fileName = `${post.id}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, bytes, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for post ${post.id}:`, uploadError);
          results.push({ postId: post.id, success: false, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        // Update the blog post with the new image URL
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update({ featured_image: publicUrlData.publicUrl })
          .eq("id", post.id);

        if (updateError) {
          console.error(`Update error for post ${post.id}:`, updateError);
          results.push({ postId: post.id, success: false, error: updateError.message });
          continue;
        }

        console.log(`Successfully migrated image for post ${post.id}: ${publicUrlData.publicUrl}`);
        results.push({ postId: post.id, success: true, imageUrl: publicUrlData.publicUrl });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        results.push({ postId: post.id, success: false, error: message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Migrated ${results.filter(r => r.success).length}/${posts.length} images`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
