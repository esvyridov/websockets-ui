import { WebSocket } from 'ws';

export type SocketsMap = Map<number, WebSocket>;

export function createSocketsMap(): SocketsMap {
    const map: SocketsMap = new Map();

    return map;
    
    // {
    //     getSocketByPlayerId(id: number) {
    //         return map.get(id);
    //     }
    // }
}