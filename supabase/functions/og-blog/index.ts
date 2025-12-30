import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("id");

    console.log("og-blog called with id:", postId);

    if (!postId) {
      console.log("Missing post ID");
      return new Response("Missing post ID", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching post from database...");

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response("Post not found", { 
        status: 404,
        headers: corsHeaders 
      });
    }

    if (!post) {
      console.log("Post not found for id:", postId);
      return new Response("Post not found", { 
        status: 404,
        headers: corsHeaders 
      });
    }

    console.log("Post found:", post.title);

    // Use the actual site URL
    const siteUrl = Deno.env.get("SITE_URL") || "https://hjorsjoaykgnsmbxgnyn.lovableproject.com";
    const postUrl = `${siteUrl}/blog/${postId}`;
    
    // Get description - clean and limit to 200 chars for OG
    const rawDescription = post.excerpt || post.content || "";
    const description = rawDescription.substring(0, 200).replace(/\n/g, " ").trim();
    
    // Featured image - must be absolute URL
    let imageUrl = post.featured_image;
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${siteUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }
    // Default fallback image if none
    if (!imageUrl) {
      imageUrl = `${siteUrl}/og-default.jpg`;
    }

    console.log("Generating HTML with OG tags...");
    console.log("Image URL:", imageUrl);

    // Generate HTML with Open Graph meta tags
    // Facebook crawler will read this HTML and extract the OG tags
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)} | Seminário Teológico</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(postUrl)}">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Seminário Teológico">
  <meta property="og:locale" content="pt_BR">
  <meta property="fb:app_id" content="">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  
  <!-- Redirect to actual page for regular users -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(postUrl)}">
  <link rel="canonical" href="${escapeHtml(postUrl)}">
  
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #333; }
    p { color: #666; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${escapeHtml(post.title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p>Redirecionando para <a href="${escapeHtml(postUrl)}">${escapeHtml(postUrl)}</a>...</p>
</body>
</html>`;

    console.log("Returning HTML response");

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    console.error("Error in og-blog:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Internal Server Error: ${errorMessage}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
