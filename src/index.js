export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const isRaw = pathname.startsWith("/raw/");
    const key = isRaw ? pathname.slice(5) : pathname.slice(1);

    const object = await env.CDN.get(key);
    if (!object) return new Response("Not Found", { status: 404 });

    const contentType =
      object.httpMetadata?.contentType || "application/octet-stream";

    if (isRaw) {
      return new Response(object.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    const filename = key.split("/").pop();

    const created = object.uploaded ? new Date(object.uploaded) : null;

    const createdDisplay = created
      ? created.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Unknown";

    const formatBytes = (bytes) => {
      if (!Number.isFinite(bytes)) return "an unknown amount";
      if (bytes === 0) return "0 B";

      const units = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));

      return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
    };

    const fileSize = formatBytes(object.size);
    const description = `i'm wasting ${fileSize} on this fucking shit`;

    const escapeHTML = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeFilename = escapeHTML(filename);

    const ua = request.headers.get("User-Agent") || "";
    const isDiscord = ua.includes("Discordbot");

    if (!isDiscord) {
      return new Response(object.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    const imageUrl = `https://cdn.playfairs.cc/raw/${key}`;

    const embedColor = "#0a0a0a";

    const embed = {
      other: {
        "theme-color": embedColor,
        ...(created && {
          pubdate: new Date(object.uploaded).toISOString(),
        }),
      },
    };

    return new Response(
      `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<meta property="og:title" content="${safeFilename}">
<meta property="og:description" content="${escapeHTML(description)}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">

<title>${safeFilename}</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    color: #fff;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  footer {
    padding: 16px 20px;
    text-align: center;
    color: #666;
    font-size: 13px;
  }
</style>
</head>

<body>

<main></main>

<footer>
  Uploaded ${escapeHTML(createdDisplay)}
</footer>

</body>
</html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "no-cache",
        },
      },
    );
  },
};