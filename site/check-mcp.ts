#!/usr/bin/env tsx
// Check the MCP server the way a directory does before it lists one, and the
// way a client does when it connects: initialize, the initialized notice, then
// tools/list. After that it runs the example of every tool.
//
//   npm run check:mcp                     In this process, on dist/data/corpus.json.
//   MCP_URL=https://… npm run check:mcp   Over HTTP, against a running server.
//
// The steps follow the public check of two directories, so a pass here means
// a pass there: appside.build (scripts/handshake.mjs of
// odedkovach/verified-remote-mcp-servers) and RAGMap (khalidsaidi/ragmap).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MCP_PATH,
  PROTOCOL_VERSIONS,
  SERVER,
  STATUS_PATH,
  TOOLS,
  handleMcp,
  type Corpus,
} from "../api/mcp";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = join(HERE, "..", "dist", "data", "corpus.json");

/** The version a directory asks for. It is older than the newest we speak. */
const ASKED_VERSION = "2025-03-26";

const LIVE = (process.env.MCP_URL ?? "").trim();
const ADDRESS = LIVE || `https://check.invalid${MCP_PATH}`;

type Answer = { status: number; type: string; body: string };
type Message = Record<string, unknown>;

class Failure extends Error {}

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Failure(message);
}

function isObject(value: unknown): value is Message {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

let corpus: Corpus | undefined;

/** Sends one request to the server under test. */
async function send(address: string, init: RequestInit): Promise<Answer> {
  let response: Response;
  if (LIVE) {
    // A directory refuses a server that redirects, so a redirect is a failure.
    response = await fetch(address, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
  } else {
    const loaded = corpus;
    check(loaded, "The corpus is not loaded.");
    response = await handleMcp(new Request(address, init), async () => loaded);
  }
  return {
    status: response.status,
    type: response.headers.get("content-type") ?? "",
    body: await response.text(),
  };
}

let protocol = ASKED_VERSION;

/** Sends one JSON-RPC message. A message without an id is a notification. */
function rpc(method: string, params?: Message, id?: number): Promise<Answer> {
  return send(ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "mcp-protocol-version": protocol,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      ...(params ? { params } : {}),
      ...(id === undefined ? {} : { id }),
    }),
  });
}

/** The result of a JSON-RPC answer, or a failure that says what came back. */
function resultOf(answer: Answer, id: number, step: string): Message {
  check(
    answer.status === 200,
    `${step}: status ${answer.status}, expected 200. ${answer.body.slice(0, 200)}`
  );
  check(
    answer.type.includes("application/json"),
    `${step}: content type "${answer.type}", expected application/json.`
  );
  let message: unknown;
  try {
    message = JSON.parse(answer.body);
  } catch {
    throw new Failure(`${step}: the answer is not JSON.`);
  }
  check(
    isObject(message) && message.jsonrpc === "2.0" && message.id === id,
    `${step}: the answer is not a JSON-RPC answer to id ${id}.`
  );
  check(
    !message.error,
    `${step}: the server answered an error: ${JSON.stringify(message.error)}`
  );
  check(isObject(message.result), `${step}: the answer has no result.`);
  return message.result;
}

function ok(step: string, detail: string): void {
  console.log(`ok    ${step}: ${detail}`);
}

async function run(): Promise<void> {
  if (LIVE) {
    console.log(`Checking the MCP server at ${LIVE}`);
  } else {
    check(
      existsSync(CORPUS),
      'dist/data/corpus.json is missing. Run "npm run build" first.'
    );
    corpus = JSON.parse(readFileSync(CORPUS, "utf8")) as Corpus;
    console.log(
      `Checking api/mcp.ts in this process, on ${corpus.terms.length} terms`
    );
  }

  // 1. initialize
  const hello = resultOf(
    await rpc(
      "initialize",
      {
        protocolVersion: ASKED_VERSION,
        capabilities: {},
        clientInfo: { name: "check-mcp", version: "1.0.0" },
      },
      1
    ),
    1,
    "initialize"
  );
  const version = hello.protocolVersion;
  check(
    typeof version === "string" && PROTOCOL_VERSIONS.includes(version),
    `initialize: protocol version ${JSON.stringify(version)} is not one this server speaks.`
  );
  const info = hello.serverInfo;
  check(
    isObject(info) && typeof info.name === "string" && info.name,
    "initialize: serverInfo has no name."
  );
  check(
    isObject(hello.capabilities) && isObject(hello.capabilities.tools),
    "initialize: the server does not say it has tools."
  );
  check(
    info.name === SERVER.name,
    `initialize: the server is "${info.name}", expected "${SERVER.name}".`
  );
  check(
    info.version === SERVER.version,
    `initialize: the running server is version ${String(info.version)}, and api/mcp.ts in this checkout is ${SERVER.version}. The deployment and the code differ.`
  );
  protocol = version;
  ok("initialize", `protocol ${version}, ${info.name} ${String(info.version)}`);

  // 2. notifications/initialized
  const noticed = await rpc("notifications/initialized");
  check(
    noticed.status === 200 || noticed.status === 202,
    `notifications/initialized: status ${noticed.status}, expected 202.`
  );
  ok("notifications/initialized", `status ${noticed.status}`);

  // 3. tools/list
  const listed = resultOf(await rpc("tools/list", {}, 2), 2, "tools/list");
  const tools = listed.tools;
  check(
    Array.isArray(tools) && tools.length > 0,
    "tools/list: no tools came back."
  );
  for (const tool of tools) {
    check(
      isObject(tool) && typeof tool.name === "string" && tool.name,
      "tools/list: a tool has no name."
    );
    check(
      typeof tool.description === "string" && tool.description,
      `tools/list: the tool "${tool.name}" has no description.`
    );
    check(
      isObject(tool.inputSchema),
      `tools/list: the tool "${tool.name}" has no inputSchema.`
    );
  }
  const names = tools.map((tool) => String((tool as Message).name));
  const expected = TOOLS.map((tool) => tool.name);
  check(
    names.join(",") === expected.join(","),
    `tools/list: the server lists ${names.join(", ")}, and api/mcp.ts has ${expected.join(", ")}.`
  );
  ok("tools/list", `${names.length} tools: ${names.join(", ")}`);

  // 4. The example of every tool. All tools only read.
  let id = 3;
  for (const tool of TOOLS) {
    const step = `tools/call ${tool.name}`;
    const called = resultOf(
      await rpc("tools/call", { name: tool.name, arguments: tool.example }, id),
      id,
      step
    );
    id += 1;
    check(called.isError !== true, `${step}: the tool answered an error.`);
    const structured = called.structuredContent;
    check(isObject(structured), `${step}: no structuredContent came back.`);
    check(
      Array.isArray(called.content) && called.content.length > 0,
      `${step}: no content came back.`
    );
    check(
      structured.found !== false && structured.total !== 0,
      `${step}: the example finds nothing.`
    );
    ok(step, `${Object.keys(structured).length} fields`);
  }

  // 5. ping, and what a browser gets when it opens the address.
  resultOf(await rpc("ping", undefined, id), id, "ping");
  ok("ping", "answered");
  const opened = await send(ADDRESS, { method: "GET" });
  check(
    opened.status === 405,
    `GET: status ${opened.status}, expected 405 with the address of the docs.`
  );
  ok("GET", "405, as documented");

  // 6. The status file of a running server.
  if (LIVE) {
    const address = new URL(STATUS_PATH, LIVE).href;
    const status = await send(address, { method: "GET" });
    check(
      status.status === 200,
      `${address}: status ${status.status}, expected 200.`
    );
    let report: unknown;
    try {
      report = JSON.parse(status.body);
    } catch {
      throw new Failure(`${address}: the answer is not JSON.`);
    }
    check(
      isObject(report) && report.ok === true,
      `${address}: the server reports it cannot read the corpus.`
    );
    const read = isObject(report.corpus) ? report.corpus : {};
    ok(
      STATUS_PATH,
      `ok, ${String(read.terms)} terms, corpus ${String(read.version)}`
    );
  }
}

run().then(
  () => console.log("The MCP server passes."),
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL  ${message}`);
    process.exit(1);
  }
);
