import { WebSocket } from "ws";
import { Context } from "../index";
import { Ship } from "../db";
import { startGameResponse, turnResponse } from "../responses";
import { BOT_ID } from "../utils";
import { BOT_SHIPS } from '../constants';

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

        const otherIndexPlayer = Object.keys(targetGame.players).find((id) => +id !== indexPlayer);

        if (otherIndexPlayer === undefined) {
            console.log(`Command - add_ships. Error: Can't find a rival for ${indexPlayer} in the game ${gameId}.`);
            return;
        }

        db.games.updateShips(targetGame.id, indexPlayer, (ships as Ship[]).map((ship) => ({ ...ship, _health: ship.length} )));

        console.log(`Command - add_ships. Ships for ${indexPlayer} were updated.`);

        if (+otherIndexPlayer === BOT_ID) {
            const randomShips: Ship[] = BOT_SHIPS[Math.floor(Math.random() * BOT_SHIPS.length)]

            db.games.updateShips(targetGame.id, BOT_ID, randomShips);

            const indexPlayerWs = socketsMap.get(indexPlayer);

            if (!indexPlayerWs) {
                console.log(`Command - add_ships. Error: Player with id ${indexPlayer} doesn't have active websocket.`);
                return;
            }

            startGameResponse(indexPlayerWs, {
                currentPlayerIndex: indexPlayer,
                ships,
            });

            turnResponse(indexPlayerWs, {
                currentPlayer: indexPlayer,
            });

            return;
        }

        if (db.games.isGameReadyToStart(targetGame.id)) {
            const playersData = Object.entries(targetGame.players)
                .map(([id, ships]) => ({id: +id, ws: socketsMap.get(+id),  ships}))
                .filter((data): data is { id: number, ws: WebSocket, ships: Ship[] } => !!data.ws)


            if (playersData.length !== 2) {
                console.log(`Command - add_ships. Error: some player in the room doesn't have active connection.`);
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

            console.log(`Command - add_ships. The game was started. The first turn was given to the first player.`);
        }
    }
};