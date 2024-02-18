import { Context } from "../index";
import { Position, Ship } from "../db";
import { attackResponse, finishResponse, turnResponse, updateWinnersResponse } from "../responses";

function getShipCoordinates(ship: Ship): Position[] {
    if (ship.direction) {
        return new Array(ship.length).fill(undefined).map((_, index) => ({ x: ship.position.x as number, y: (ship.position.y as number) + index }));
    }

    return new Array(ship.length).fill(undefined).map((_, index) => ({ x: (ship.position.x as number) + index, y: ship.position.y as number }));
}

function getShipAroundCoordinates(ship: Ship): {x: number, y: number}[] {
    const coordinates = getShipCoordinates(ship);
    const aroundCoordinates: Position[] = [];
    const firstCoodinate = coordinates[0];
    const lastCoordinate = coordinates[coordinates.length - 1];

    if (ship.direction) {
        aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
            x: firstCoodinate.x + value,
            y: firstCoodinate.y - 1,
        })));
        
        coordinates.forEach((coordinate) => {
            aroundCoordinates.push(...[-1, 1].map((value) => ({
                x: coordinate.x + value,
                y: coordinate.y,
            })))
        })

        aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
            x: lastCoordinate.x + value,
            y: lastCoordinate.y + 1,
        })));

        return aroundCoordinates;
    }

    aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
            x: firstCoodinate.x - 1,
            y: firstCoodinate.y + value,
        })));
    
    coordinates.forEach((coordinate) => {
        aroundCoordinates.push(...[-1, 1].map((value) => ({
            x: coordinate.x,
            y: coordinate.y + value,
        })))
    })

    aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
        x: lastCoordinate.x + 1,
        y: lastCoordinate.y + value,
    })));

    return aroundCoordinates;
}

export function attackHandler(context: Context) {
    const { db, socketsMap } = context;
    return (data: any) => {
        const { gameId, x, y, indexPlayer } = JSON.parse(data);

        const indexPlayerWs = socketsMap.get(indexPlayer);

        if (!indexPlayerWs) {
            console.error(`Error: attack; indexPlayer websocket doesn't exist.`);
            return;
        }

        const targetGame = db.games.getGameById(gameId);

        if (!targetGame) {
            console.error(`Error: attack; targetGame doesn't exist.`);
            return;
        }

        if (!(indexPlayer in targetGame.players)) {
            console.error(`Error: attack; indexPlayer doesn't exist in the game.`);
            return;
        }

        const otherIndexPlayer = Object.keys(targetGame.players).find((id) => +id !== indexPlayer);

        if (otherIndexPlayer === undefined) {
            console.error(`Error: attack; can't determine another player in the game.`);
            return;
        }

        const otherIndexPlayerWs = socketsMap.get(+otherIndexPlayer);

        if (!otherIndexPlayerWs) {
            console.error(`Error: attack; otherIndexPlayer websocket doesn't exist.`);
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
            attackResponse(indexPlayerWs, {
                position: {
                    x,
                    y
                },
                currentPlayer: indexPlayer,
                status: 'miss',
            });

            [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
                turnResponse(ws, {
                    currentPlayer: +otherIndexPlayer,
                });
            })
        } else {
            targetShip._health--;

            if (targetShip._health === 0) {
                const coordinates = getShipCoordinates(targetShip);
                const aroundCoordinates = getShipAroundCoordinates(targetShip);

                coordinates.forEach((coordinate) => {
                    attackResponse(indexPlayerWs, {
                        position: {
                            x: coordinate.x,
                            y: coordinate.y,
                        },
                        currentPlayer: indexPlayer,
                        status: 'killed',
                    });
                });

                aroundCoordinates.forEach((coordinate) => {
                    attackResponse(indexPlayerWs, {
                        position: {
                            x: coordinate.x,
                            y: coordinate.y,
                        },
                        currentPlayer: indexPlayer,
                        status: 'miss',
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

                    db.winners.addWin(winner.name);

                    updateWinnersResponse(context)();
                }
            } else {
                attackResponse(indexPlayerWs, {
                    position: {
                        x,
                        y
                    },
                    currentPlayer: indexPlayer,
                    status: 'shot',
                });
            }

            [indexPlayerWs, otherIndexPlayerWs].forEach((ws) => {
                turnResponse(ws, {
                    currentPlayer: indexPlayer,
                });
            })
        }
    }
}