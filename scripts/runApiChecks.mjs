#!/usr/bin/env node
import http from "http";

function httpRequest(method, url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      method,
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + (u.search || ""),
      headers: body
        ? {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
          }
        : {}
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const base = process.env.API_BASE || "http://localhost:3000";
  const tests = [];

  // Positive checks
  tests.push(async () => {
    const res = await httpRequest("GET", `${base}/health`);
    assert(res.status === 200, `Health expected 200, got ${res.status}`);
    return { name: "health", ok: true };
  });
  tests.push(async () => {
    const res = await httpRequest("GET", `${base}/api/widget-config/incharge/us-tx/customer`);
    assert(res.status === 200, `InCharge config expected 200, got ${res.status}`);
    return { name: "incharge-config", ok: true };
  });
  tests.push(async () => {
    const body = JSON.stringify({ message: "Hello" });
    const res = await httpRequest("POST", `${base}/api/chat/incharge/us-tx/customer`, body);
    assert(res.status === 200, `InCharge chat expected 200, got ${res.status}`);
    return { name: "incharge-chat", ok: true };
  });
  tests.push(async () => {
    const res = await httpRequest("GET", `${base}/api/widget-config/lenhart/us-fl/customer`);
    assert(res.status === 200, `Lenhart config expected 200, got ${res.status}`);
    return { name: "lenhart-config", ok: true };
  });
  tests.push(async () => {
    const body = JSON.stringify({ message: "Hello" });
    const res = await httpRequest("POST", `${base}/api/chat/lenhart/us-fl/customer`, body);
    assert(res.status === 200, `Lenhart chat expected 200, got ${res.status}`);
    return { name: "lenhart-chat", ok: true };
  });

  // Negative checks
  tests.push(async () => {
    const res = await httpRequest("GET", `${base}/api/widget-config/unknown/us-tx/customer`);
    assert(res.status === 404, `Unknown brand expected 404, got ${res.status}`);
    return { name: "neg-unknown-brand", ok: true };
  });
  tests.push(async () => {
    const res = await httpRequest("GET", `${base}/api/widget-config/incharge/zz-zz/customer`);
    assert(res.status === 404, `Unknown region expected 404, got ${res.status}`);
    return { name: "neg-unknown-region", ok: true };
  });
  tests.push(async () => {
    const res = await httpRequest("GET", `${base}/api/widget-config/lenhart/us-fl/unknown`);
    assert(res.status === 404, `Unknown persona expected 404, got ${res.status}`);
    return { name: "neg-unknown-persona", ok: true };
  });
  tests.push(async () => {
    const body = JSON.stringify({});
    const res = await httpRequest("POST", `${base}/api/chat/incharge/us-tx/customer`, body);
    assert(res.status === 400, `Chat missing body expected 400, got ${res.status}`);
    return { name: "neg-chat-missing", ok: true };
  });
  tests.push(async () => {
    const body = JSON.stringify({ message: "" });
    const res = await httpRequest("POST", `${base}/api/chat/incharge/us-tx/customer`, body);
    assert(res.status === 400, `Chat empty message expected 400, got ${res.status}`);
    return { name: "neg-chat-empty", ok: true };
  });
  tests.push(async () => {
    const long = "A".repeat(5000);
    const body = JSON.stringify({ message: long });
    const res = await httpRequest("POST", `${base}/api/chat/lenhart/us-fl/customer`, body);
    assert(res.status === 413, `Chat too long expected 413, got ${res.status}`);
    return { name: "neg-chat-too-long", ok: true };
  });

  let passed = 0;
  for (const t of tests) {
    try {
      const r = await t();
      passed += 1;
      console.log(`PASS ${r.name}`);
    } catch (e) {
      console.error(`FAIL: ${e.message}`);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} checks passed`);
}

run().catch((e) => { console.error(e); process.exit(1); });
