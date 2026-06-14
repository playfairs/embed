if (url.pathname.startsWith("/e/")) {
  const key = url.pathname.slice(3);

  const object = await env.CDN.get(key);

  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const filename = key.split("/").pop();
  const bucketName = "cdn";

  const created = object.uploaded
    ? new Date(object.uploaded).toISOString()
    : "Unknown";

  const imageUrl = `https://cdn.playfairs.cc/${key}`;

  const description = `${filename} • ${created}`;

  return new Response(
`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<meta property="og:title" content="${bucketName}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${bucketName}">

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
}