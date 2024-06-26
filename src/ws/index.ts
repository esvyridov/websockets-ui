import { WebSocket, WebSocketServer } from 'ws';
import { DB, createDB } from './db';
import { Session, createSession } from './session';
import { SocketsMap, createSocketsMap } from './socketsMap';
import { createRoomHandler, regHandler, addUserToRoomHandler, addShipsHandler, attackHandler, randomAttackHandler, singlePlayHandler } from './handlers';
import { doesSessionHaveUser } from './utils';
import { finishResponse, updateWinnersResponse } from './responses';

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

                const userRoom = db.rooms.getRoomByUserId(user.id);

                if (userRoom) {
                    db.rooms.deleteByUserId(user.id);

                    console.log(`Room with id ${userRoom.roomId} was deleted because ${user.name}:${user.id} lost connection to the server.`)
                }

                const userGame = db.games.getGameByUserId(user.id);

                if (userGame) {
                    const rivalId = Object.keys(userGame.players).find((id) => +id !== user.id);

                    if (!rivalId) {
                        db.games.deleteById(userGame.id);

                        console.log(`Game with id ${userGame.id} was deleted because ${user.name}:${user.id} lost connection to the server.`);
                    } else {
                        const rivalWs = socketsMap.get(+rivalId);

                        if (!rivalWs) {
                            db.games.deleteById(userGame.id);

                            console.log(`Game with id ${userGame.id} was deleted because ${user.name}:${user.id} lost connection to the server.`);
                        } else {
                            finishResponse(rivalWs, {
                                winPlayer: +rivalId,
                            });
        
                            const winner = db.users.getById(+rivalId);
        
                            if (!winner) {
                                db.games.deleteById(userGame.id);

                                console.log(`Game with id ${userGame.id} was deleted because ${user.name}:${user.id} lost connection to the server.`);
                                console.error(`Error: cleanup; winner doesn't exist.`);
                                return;
                            } else {
                                db.games.deleteById(userGame.id);
                                db.winners.addWin(winner.name);
                                updateWinnersResponse(context)();

                                console.log(`Game with id ${userGame.id} was deleted because ${user.name}:${user.id} lost connection to the server. ${winner.name} automatically won the game.`);
                            }
                        }
                    }
                }

                socketsMap.delete(user.id);

                console.log(`Connection was closed for ${user.name}:${user.id}.`);
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
                } else if (type === 'single_play') {
                    singlePlayHandler(context)(data);
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
        const address = wss.address();

        if (typeof address === 'string') {
            console.log(`WS server is listening on ${PORT} port!`)
        } else {
            console.log(`WS server is listening on ${address.address}:${address.port} port!`)
        }
    })

    return wss;
}

