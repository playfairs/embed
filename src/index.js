export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/e/")) {
      const key = url.pathname.slice(3);

      const object = await env.CDN.get(key);

      if (!object) {
        return new Response("Not Found", { status: 404 });
      }

      const filename = key.split("/").pop();

      const created = object.uploaded
        ? new Date(object.uploaded).toISOString()
        : "Unknown";

      const imageUrl = `https://cdn.playfairs.cc/${key}`;

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<meta property="og:title" content="${filename}">
<meta property="og:description" content="cdn • ${created}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
</head>
<body></body>
</html>`;

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
        },
      });
    }

    const key = url.pathname.slice(1);

    const object = await env.CDN.get(key);

    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "Content-Type":
          object.httpMetadata?.contentType ||
          "application/octet-stream",
      },
    });
  },
};