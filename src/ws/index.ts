import { WebSocket, WebSocketServer } from 'ws';
import { DB, createDB } from './db';
import { Session, createSession } from './session';
import { SocketsMap, createSocketsMap } from './socketsMap';
import { createRoomHandler, regHandler, addUserToRoomHandler, addShipsHandler, attackHandler, randomAttackHandler } from './handlers';
import { doesSessionHaveUser } from './utils';

const PORT = 3000;

export type Context = {
    ws: WebSocket;
    db: DB;
    session: Session;
    socketsMap: SocketsMap;
}

function handleError(session: Session, err: unknown) {
    if (doesSessionHaveUser(session)) {
        const user = session.getUser();

        console.log(`Internal server error has happened while processing ${user.name}:${user.id} - ${err}. Connection will be closed.`);
    }
    
    console.log(`Internal server error has happened while processing unknown user - ${err}. Connection will be closed.`);
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
            if (doesSessionHaveUser(session)) {
                const user = session.getUser();

                db.rooms.deleteByUserId(user.id);

                socketsMap.delete(user.id);

                console.log(`Connection was closed for ${user.name}:${user.id}. A room created by the user was deleted (if any).`);
            }
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
                handleError(session, err);

                ws.close();
            }
        })
        
        ws.on('error', (err) => {
            handleError(session, err);

            ws.close();
        });
        ws.on('close', cleanup);
    })

    wss.on('listening', () => {
        console.log(`WS server is listening on ${PORT} port!`)
    })

    return wss;
}

