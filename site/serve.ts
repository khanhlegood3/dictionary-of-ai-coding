#!/usr/bin/env -S npx tsx
// Serve dist/ on this machine, with the MCP server at /api/mcp.
// It stands in for Vercel: clean addresses, the 404 page, and the rewrites of
// vercel.json. Run "npm run build" first, then "npm run preview".
//
// The MCP server here reads dist/data/corpus.json from the disk. On Vercel it
// fetches the same file over HTTP. Restart this server after a new build, as
// the MCP server keeps the corpus it read first.

import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { CORPUS_PATH, STATUS_PATH, handleMcp, type Corpus } from "../api/mcp";

const OUT = join(dirname(dirname(fileURLToPath(import.meta.url))), "dist");
const PORT = Number(process.env.PORT || 3000);
// Every address that vercel.json sends to the function.
const MCP_PATHS = new Set(["/api/mcp", STATUS_PATH]);

const TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

if (!existsSync(join(OUT, "index.html"))) {
  console.error('dist/ is empty. Run "npm run build" first.');
  process.exit(1);
}

async function corpusFromDisk(): Promise<Corpus> {
  return JSON.parse(readFileSync(join(OUT, CORPUS_PATH), "utf8")) as Corpus;
}

/** The file an address stands for, the way Vercel resolves clean addresses. */
function fileFor(pathname: string): string | null {
  const path = normalize(join(OUT, decodeURIComponent(pathname)));
  if (path !== OUT && !path.startsWith(OUT + sep)) return null;
  for (const candidate of [path, `${path}.html`, join(path, "index.html")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const address = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (MCP_PATHS.has(address.pathname)) {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers))
        if (typeof value === "string") headers.set(name, value);
      // Vercel puts the caller's address in this header; so does this server.
      headers.set("x-real-ip", req.socket.remoteAddress ?? "unknown");
      const method = req.method ?? "GET";
      const answer = await handleMcp(
        new Request(address, {
          method,
          headers,
          body:
            method === "GET" || method === "HEAD"
              ? null
              : Buffer.concat(chunks),
        }),
        corpusFromDisk
      );
      res.writeHead(answer.status, Object.fromEntries(answer.headers));
      res.end(Buffer.from(await answer.arrayBuffer()));
      return;
    }

    const file = fileFor(address.pathname);
    const found = file ?? join(OUT, "404.html");
    const cors =
      address.pathname.startsWith("/data/") ||
      address.pathname.endsWith(".txt");
    res.writeHead(file ? 200 : 404, {
      "content-type": TYPES[extname(found)] ?? "application/octet-stream",
      "cache-control": "no-cache",
      ...(cors ? { "access-control-allow-origin": "*" } : {}),
    });
    res.end(req.method === "HEAD" ? undefined : readFileSync(found));
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.message : String(error));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serving dist/ at http://localhost:${PORT} (MCP at /api/mcp)`);
});
