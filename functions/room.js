import { getStore } from "@netlify/blobs";

// GET  /api/room?code=ABCDE   -> { room: {...} | null }
// POST /api/room  (body = full room JSON, must include "code") -> { ok: true }
export default async (req) => {
  const store = getStore("loadout-draw-rooms");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response(JSON.stringify({ error: "missing code" }), { status: 400 });
    }
    const room = await store.get(code, { type: "json" });
    return new Response(JSON.stringify({ room: room || null }), {
      headers: { "content-type": "application/json" }
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid json" }), { status: 400 });
    }
    if (!body || !body.code) {
      return new Response(JSON.stringify({ error: "missing code" }), { status: 400 });
    }
    await store.setJSON(body.code, body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" }
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/room" };
