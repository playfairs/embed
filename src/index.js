export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const isRaw = pathname.startsWith("/raw/");
    const key = isRaw ? pathname.slice(5) : pathname.slice(1);

    const object = await env.CDN.get(key);
    if (!object) return new Response("Not Found", { status: 404 });

    if (isRaw) {
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    const filename = key.split("/").pop();
    const created = object.uploaded
      ? new Date(object.uploaded).toISOString()
      : "Unknown";

    const ua = request.headers.get("User-Agent") || "";
    const isDiscord = ua.includes("Discordbot");

    if (!isDiscord) {
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    const imageUrl = `https://cdn.playfairs.cc/raw/${key}`;
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta property="og:title" content="${filename}">
<meta property="og:description" content="Uploaded: ${created}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<title>${filename}</title>
</head>
<body></body>
</html>`,
      { headers: { "Content-Type": "text/html; charset=UTF-8" } }
    );
  },
};