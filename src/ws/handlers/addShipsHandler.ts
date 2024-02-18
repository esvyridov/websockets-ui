import { WebSocket } from "ws";
import { Context } from "../index";
import { Ship } from "../db";
import { startGameResponse, turnResponse } from "../responses";

export function addShipsHandler(context: Context) {
    const { db, socketsMap } = context;
    return (data: any) => {
        const { gameId, ships, indexPlayer } = JSON.parse(data);

        const targetGame = db.games.getGameById(gameId);

        if (!targetGame) {
            console.error(`Error: add_ships; targetGame doesn't exist.`)
            return;
        }

        if (!(indexPlayer in targetGame.players)) {
            console.error(`Error: add_ships; indexPlayer is not found in the game.`)
            return;
        }

        db.games.updateShips(targetGame.id, indexPlayer, (ships as Ship[]).map((ship) => ({ ...ship, _health: ship.length} )));

        if (db.games.isGameReadyToStart(targetGame.id)) {
            const playersData = Object.entries(targetGame.players)
                .map(([id, ships]) => ({id: +id, ws: socketsMap.get(+id),  ships}))
                .filter((data): data is { id: number, ws: WebSocket, ships: Ship[] } => !!data.ws)


            if (playersData.length !== 2) {
                console.error(`Error: add_ships; a player in the room doesn't have active socket.`)
                return;
            }

            playersData.forEach(({id, ws, ships}) => {
                startGameResponse(ws, {
                    currentPlayerIndex: id,
                    ships,
                })
            });

            const playerDataToStart = playersData[0];

            playersData.forEach(({ ws }) => {
                turnResponse(ws, {
                    currentPlayer: playerDataToStart.id,
                });
            });
        }
    }
};