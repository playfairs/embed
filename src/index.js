export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    const object = await env.CDN.get(key);

    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    const filename = key.split("/").pop();

    const created = object.uploaded
      ? new Date(object.uploaded).toISOString()
      : "Unknown";

    const imageUrl = `https://cdn.playfairs.cc/${key}`;

    if (url.searchParams.get("raw") === "1") {
      return new Response(object.body, {
        headers: {
          "Content-Type":
            object.httpMetadata?.contentType ||
            "application/octet-stream",
        },
      });
    }

    return new Response(
`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<meta property="og:title" content="${filename}">
<meta property="og:description" content="Uploaded: ${created}">
<meta property="og:image" content="${imageUrl}?raw=1">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<title>${filename}</title>
</head>
<body></body>
</html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
        },
      }
    );
  },
};