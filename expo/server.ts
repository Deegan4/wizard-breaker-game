import { serve } from "bun";
import { readFile, readdir } from "fs/promises";
import { join, extname } from "path";

const ROOT = process.argv[2] ?? "./dist";
const PORT = parseInt(process.argv[3] ?? "8080");

const MIME = {
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
  async fetch(req) {
    let url = new URL(req.url).pathname;
    if (url === "/") url = "/index.html";
    const filePath = join(ROOT, url);
    try {
      const data = await readFile(filePath);
      const ext = extname(filePath);
      return new Response(data, {
        headers: {
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Cache-Control": "no-cache",
        },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },
});

console.log(`Serving ${ROOT} on port ${PORT}`);
