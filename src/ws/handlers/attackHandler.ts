import { Context } from "../index";
import { attackResponse, finishResponse, turnResponse, updateWinnersResponse } from "../responses";
import { getShipAroundCoordinates, getShipCoordinates } from "../utils";

export function attackHandler(context: Context) {
    const { db, socketsMap } = context;
    return (data: any) => {
        const { gameId, x, y, indexPlayer } = JSON.parse(data);

        const indexPlayerWs = socketsMap.get(indexPlayer);

        if (!indexPlayerWs) {
            console.log(`Command - attack. Error: Player with id ${indexPlayer} doesn't have active websocket.`);
            return;
        }

        const targetGame = db.games.getGameById(gameId);

        if (!targetGame) {
            console.log(`Command - attack. Error: Game with ${gameId} doesn't exist.`);
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

        if (!otherIndexPlayerWs) {
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

        if (!targetShip) {
            [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
                attackResponse(ws, {
                    position: {
                        x,
                        y
                    },
                    currentPlayer: indexPlayer,
                    status: 'miss',
                });
            });

            db.games.addShot(gameId, indexPlayer, { x, y });

            [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
                turnResponse(ws, {
                    currentPlayer: +otherIndexPlayer,
                });
            })

            console.log(`Command - attack. Player ${indexPlayer} missed. A turn goes to player ${otherIndexPlayer}`);
        } else {
            targetShip._health--;

            if (targetShip._health === 0) {
                const coordinates = getShipCoordinates(targetShip);
                const aroundCoordinates = getShipAroundCoordinates(targetShip);

                db.games.addShots(gameId, indexPlayer, coordinates);
                db.games.addShots(gameId, indexPlayer, aroundCoordinates);

                [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
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

                [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
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
                    [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
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

                    console.log(`Command - attack. Player with id ${indexPlayer} won the game. Winners list was been updated. The game was deleted.`);
                }
            } else {
                [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
                    attackResponse(indexPlayerWs, {
                        position: {
                            x,
                            y
                        },
                        currentPlayer: indexPlayer,
                        status: 'shot',
                    });
                });

                db.games.addShot(gameId, indexPlayer, { x, y });

                console.log(`Command - attack. Player ${indexPlayer} hit a part of a ship. The next turn will be done by ${indexPlayer}`);
            }

            [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
                turnResponse(ws, {
                    currentPlayer: indexPlayer,
                });
            })
        }
    }
}