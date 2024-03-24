import { WebSocket } from "ws";
import { Context } from "../index";
import { attackResponse, finishResponse, turnResponse, updateWinnersResponse } from "../responses";
import { BOT_ID, getShipAroundCoordinates, getShipCoordinates, sleep } from "../utils";
import { randomAttackHandler } from ".";

export function attackHandler(context: Context) {
    const { db, socketsMap } = context;
    return async (data: any) => {
        try {
            const { gameId, x, y, indexPlayer } = JSON.parse(data);
    
            const indexPlayerWs = socketsMap.get(indexPlayer);
    
            if (indexPlayer !== BOT_ID && !indexPlayerWs) {
                console.log(`Command - attack. Error: Player with id ${indexPlayer} doesn't have active websocket.`);
                return;
            }
    
            const targetGame = db.games.getGameById(gameId);
    
            if (!targetGame) {
                console.log(`Command - attack. Error: Game with ${gameId} doesn't exist.`);
                return;
            }

            if (targetGame._nextPlayerIdTurn !== indexPlayer) {
                return;
            }
    
            if (!(indexPlayer in targetGame.players)) {
                console.log(`Command - attack. Error: Player with id ${indexPlayer} doesn't exist in the list of players of game ${gameId}.`);
                return;
            }
    
            const otherIndexPlayer = Object.keys(targetGame.players).find((id) => +id !== indexPlayer);
    
            if (otherIndexPlayer === undefined) {
                console.log(`Command - attack. Error: Can't find a rival for ${indexPlayer} in the game ${gameId}.`);
                return;
            }
    
            const otherIndexPlayerWs = socketsMap.get(+otherIndexPlayer);
    
            if (+otherIndexPlayer !== BOT_ID && !otherIndexPlayerWs) {
                console.log(`Command - attack. Error: Player with id ${otherIndexPlayer} doesn't have active websocket.`);
                return;
            }
    
            const otherPlayerShips = targetGame.players[+otherIndexPlayer];
            const targetShip = otherPlayerShips.find((ship) => {
                const coordinates: { x: number; y: number }[] = getShipCoordinates(ship);
    
                return coordinates.some((coordinate) => {
                    return coordinate.x === x && coordinate.y === y;
                });
            });
    
            const playersWss = [indexPlayerWs, otherIndexPlayerWs].filter((ws): ws is WebSocket => !!ws);
    
            if (targetGame._shots[indexPlayer].some((shot) => shot.x === x && shot.y === y)) {
                targetGame._nextPlayerIdTurn = +otherIndexPlayer;
                playersWss.forEach((ws) => {
                    turnResponse(ws, {
                        currentPlayer: targetGame._nextPlayerIdTurn,
                    });
                });
                if (+otherIndexPlayer === BOT_ID) {
                    await sleep();
                    randomAttackHandler(context)(JSON.stringify({
                        gameId,
                        indexPlayer: +otherIndexPlayer,
                    }))
                }
                return;
            }

            if (!targetShip) {
                playersWss.forEach((ws) => {
                    attackResponse(ws, {
                        position: {
                            x,
                            y
                        },
                        currentPlayer: indexPlayer,
                        status: 'miss',
                    });
                });
    
                targetGame._nextPlayerIdTurn = +otherIndexPlayer;
                targetGame._shots[indexPlayer].push({x, y});
    
                playersWss.forEach((ws) => {
                    turnResponse(ws, {
                        currentPlayer: targetGame._nextPlayerIdTurn,
                    });
                })
    
                console.log(`Command - attack. Player ${indexPlayer} missed. A turn goes to player ${otherIndexPlayer}`);
    
                if (+otherIndexPlayer === BOT_ID) {
                    await sleep();
                    randomAttackHandler(context)(JSON.stringify({
                        gameId,
                        indexPlayer: +otherIndexPlayer,
                    }))
                }
            } else {
                targetShip._health--;
    
                if (targetShip._health === 0) {
                    const coordinates = getShipCoordinates(targetShip);
                    const aroundCoordinates = getShipAroundCoordinates(targetShip);
    
                    targetGame._shots[indexPlayer].push(...coordinates);
                    targetGame._shots[indexPlayer].push(...aroundCoordinates);
    
                    playersWss.forEach((ws) => {
                        coordinates.forEach((coordinate) => {
                            attackResponse(ws, {
                                position: {
                                    x: coordinate.x,
                                    y: coordinate.y,
                                },
                                currentPlayer: indexPlayer,
                                status: 'killed',
                            });
                        });
                    });
                    
                    console.log(`Command - attack. Player ${indexPlayer} killed a ship. The next turn will be done by ${indexPlayer}`);
    
                    playersWss.forEach((ws) => {
                        aroundCoordinates.forEach((coordinate) => {
                            attackResponse(ws, {
                                position: {
                                    x: coordinate.x,
                                    y: coordinate.y,
                                },
                                currentPlayer: indexPlayer,
                                status: 'miss',
                            });
                        });
                    });
    
                    if (otherPlayerShips.every((ship) => ship._health === 0)) {
                        playersWss.forEach((ws) => {
                            finishResponse(ws, {
                                winPlayer: indexPlayer,
                            });
                        });
    
                        const winner = db.users.getById(indexPlayer);
    
                        if (!winner) {
                            console.error(`Error: attack; winner doesn't exist.`);
                            return;
                        }
    
                        db.games.deleteById(gameId);
                        db.winners.addWin(winner.name);
    
                        updateWinnersResponse(context)();
    
                        console.log(`Command - attack. Player with id ${indexPlayer} won the game. The game was deleted. Winners were updated.`);
                    }
                } else {
                    playersWss.forEach((ws) => {
                        attackResponse(ws, {
                            position: {
                                x,
                                y
                            },
                            currentPlayer: indexPlayer,
                            status: 'shot',
                        });
                    });
    
                    targetGame._shots[indexPlayer].push({ x, y });
    
                    console.log(`Command - attack. Player ${indexPlayer} hit a part of a ship. The next turn will be done by ${indexPlayer}`);
                }
    
                playersWss.forEach((ws) => {
                    turnResponse(ws, {
                        currentPlayer: targetGame._nextPlayerIdTurn,
                    });
                })
    
                if (indexPlayer === BOT_ID) {
                    await sleep();
                    randomAttackHandler(context)(JSON.stringify({
                        gameId,
                        indexPlayer,
                    }))
                }
            }
        } catch (err) {
            throw err;
        }
    }
}