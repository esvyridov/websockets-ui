import { WebSocket, WebSocketServer } from 'ws';
import { DB, createDB } from './db';
import { Session, createSession } from './session';
import { SocketsMap, createSocketsMap } from './socketsMap';
import { createRoomHandler, regHandler, addUserToRoomHandler, addShipsHandler, attackHandler, randomAttackHandler } from './handlers';

const PORT = 3000;

export type Context = {
    ws: WebSocket;
    db: DB;
    session: Session;
    socketsMap: SocketsMap;
}

export function createWSS() {
    const db = createDB();
    const socketsMap = createSocketsMap();
    const wss = new WebSocketServer({ port: PORT });

    wss.on('connection', (ws) => {
        const session = createSession();
        const context: Context = {
            ws,
            db,
            session,
            socketsMap,
        };

        function cleanup() {
            // TODO
            // if (currentPlayer) {
            //     const roomWithCurrentPlayer = rooms.findIndex((room) => room.roomUsers.some((roomUser) => roomUser.index === currentPlayer?.id));

            //     if (roomWithCurrentPlayer !== -1) {
            //         rooms = [...rooms.slice(0, roomWithCurrentPlayer), ...rooms.slice(roomWithCurrentPlayer + 1)];
            //     }

            //     playersWebSocketMap.delete(currentPlayer.id);
            // }

            // currentPlayer = undefined;
        }

        ws.on('message', (msg) => {
            try {
                const { type, data } = JSON.parse(msg.toString());
                
                if (type === 'reg') {
                    regHandler(context)(data);
                } else if (type === 'create_room') {
                    createRoomHandler(context)();
                } else if (type === 'add_user_to_room') {
                    addUserToRoomHandler(context)(data);
                } else if (type === 'add_ships') {
                    addShipsHandler(context)(data);
                } else if (type === 'attack') {
                    attackHandler(context)(data);
                } else if (type === 'randomAttack') {
                    randomAttackHandler(context)(data);
                }
            } catch (err) {
                console.error(err);
                ws.close();
            }
        })
        
        ws.on('error', (err) => {
            console.log(err);
            ws.close();
        });
        ws.on('close', cleanup);
    })

    wss.on('listening', () => {
        console.log(`WS server is listening on ${PORT} port!`)
    })

    return wss;
}

