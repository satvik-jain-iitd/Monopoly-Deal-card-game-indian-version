export interface Env {
  GAME_ROOM: DurableObjectNamespace;
}

export class GameRoom implements DurableObject {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket];
    this.state.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const clients = this.state.getWebSockets();
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.READY_STATE_OPEN) {
        client.send(message as string);
      }
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    ws.close();
    const clients = this.state.getWebSockets();
    const payload = JSON.stringify({ type: "PLAYER_LEFT" });
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.READY_STATE_OPEN) {
        client.send(payload);
      }
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Upgrade, Connection",
        },
      });
    }

    const url = new URL(request.url);
    const roomCode = url.pathname.replace(/^\//, "").toUpperCase();

    if (!roomCode || roomCode.length === 0) {
      return new Response("Room code required", { status: 400 });
    }

    const id = env.GAME_ROOM.idFromName(roomCode);
    const stub = env.GAME_ROOM.get(id);
    return stub.fetch(request);
  },
};
