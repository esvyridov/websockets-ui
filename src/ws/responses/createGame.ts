

import { WebSocket } from "ws";

export function createGameResponse(ws: WebSocket, data: {
    idGame: number;
    idPlayer: number;
}) {
    ws.send(JSON.stringify({
        type: 'create_game',
        data: JSON.stringify(data),
        id: 0,
    }));
}