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
            console.log(`Command - add_ships. Error: targetGame doesn't exist.`);
            return;
        }

        if (!(indexPlayer in targetGame.players)) {
            console.log(`Command - add_ships. Error: indexPlayer is not found in the game.`);
            return;
        }

        db.games.updateShips(targetGame.id, indexPlayer, (ships as Ship[]).map((ship) => ({ ...ship, _health: ship.length} )));

        console.log(`Command - add_ships. Ships for ${indexPlayer} were updated.`);

        if (db.games.isGameReadyToStart(targetGame.id)) {
            const playersData = Object.entries(targetGame.players)
                .map(([id, ships]) => ({id: +id, ws: socketsMap.get(+id),  ships}))
                .filter((data): data is { id: number, ws: WebSocket, ships: Ship[] } => !!data.ws)


            if (playersData.length !== 2) {
                console.log(`Command - add_ships. Error: some player is the room doesn't have active connection.`);
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

            console.log(`Command - add_ships. The game is ready to start.`);
            console.log(`Command - add_ships. Side effects: The game was started, a turn was given to the first player.`);
        }
    }
};