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
    console.log("User-Agent:", req.headers.get("user-agent"));

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

    // Site URL (used only for building a human-friendly link)
    // In production, set SITE_URL in backend secrets to your real domain.
    const siteUrl = Deno.env.get("SITE_URL") || "https://seminarioteologico.app";

    // Use the current request URL as the canonical/share URL
    const postUrl = req.url;

    // Public route (no login wall)
    const redirectUrl = `${siteUrl}/p/blog/${postId}`;
    
    // Get description - clean and limit to 200 chars for OG
    const rawDescription = post.excerpt || post.content || "";
    const description = rawDescription
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, " ")
      .substring(0, 200)
      .trim();
    
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
    console.log("Post URL:", postUrl);

    // Generate HTML with Open Graph meta tags
    // Facebook crawler will read this HTML and extract the OG tags
    const html = `<!DOCTYPE html>
<html lang="pt-BR" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)} | Seminário Teológico</title>
  
  <!-- Essential Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(postUrl)}">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Seminário Teológico">
  <meta property="og:locale" content="pt_BR">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  
  <!-- Article metadata -->
  <meta property="article:published_time" content="${post.published_at || post.created_at}">
  ${post.author_name ? `<meta property="article:author" content="${escapeHtml(post.author_name)}">` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(postUrl)}">
  
  <!-- Redirect to actual page for regular users (delayed to allow crawlers to read) -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(postUrl)}">
  
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #1a1a2e; color: #fff; }
    h1 { color: #fff; }
    p { color: #ccc; }
    a { color: #4dabf7; }
    img { max-width: 100%; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <article>
    <h1>${escapeHtml(post.title)}</h1>
    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(post.title)}">` : ''}
    <p>${escapeHtml(description)}</p>
    <p>Redirecionando para <a href="${escapeHtml(postUrl)}">${escapeHtml(postUrl)}</a>...</p>
  </article>
</body>
</html>`;

    console.log("Returning HTML response");

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
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
