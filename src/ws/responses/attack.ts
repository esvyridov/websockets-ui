import { WebSocket } from 'ws';

export function attackResponse(ws: WebSocket, data: {
    position: {
        x: number;
        y: number;
    };
    currentPlayer: number;
    status: 'miss' | 'killed' | 'shot';
}) {
    ws.send(JSON.stringify({
        type: 'attack',
        data: JSON.stringify(data),
        id: 0,
    }));
}