

import { WebSocket } from "ws";
import { Ship } from "../db";

export function startGameResponse(ws: WebSocket, data: {
    currentPlayerIndex: number;
    ships: Ship[];
}) {
    ws.send(JSON.stringify({
        type: 'start_game',
        data: JSON.stringify(data),
        id: 0,
    }));
}