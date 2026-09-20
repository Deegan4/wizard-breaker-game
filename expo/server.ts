import { file, serve } from "bun";
import { join, extname } from "path";

const ROOT = process.argv[2] ?? "./dist";
const PORT = parseInt(process.argv[3] ?? "8080");

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
};

serve({
  port: PORT,
  async fetch(req: Request) {
    let url = new URL(req.url).pathname;
    if (url === "/") url = "/index.html";
    const filePath = join(ROOT, url);
    const bunFile = file(filePath);
    if (!(await bunFile.exists())) {
      return new Response("Not Found", { status: 404 });
    }
    const ext = extname(filePath);
    return new Response(bunFile, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "no-cache",
      },
    });
  },
});

console.log(`Serving ${ROOT} on port ${PORT}`);
