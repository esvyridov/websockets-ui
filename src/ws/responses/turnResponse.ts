

import { WebSocket } from "ws";

export function turnResponse(ws: WebSocket, data: {
    currentPlayer: number;
}) {
    ws.send(JSON.stringify({
        type: 'turn',
        data: JSON.stringify(data),
        id: 0,
    }));
}