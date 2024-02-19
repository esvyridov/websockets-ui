import { Context } from "../index";
import { updateRoomsResponse, updateWinnersResponse, createGameResponse } from "../responses";
import { doesSessionHaveUser } from "../utils";

export function addUserToRoomHandler(context: Context) {
    const { ws, db, session, socketsMap } = context;
    return (data: any) => {
        if (!doesSessionHaveUser(session)) {
            console.error(`Error: add_user_to_room; currentPlayer is undefined.`)
            return;
        }

        const { indexRoom } = JSON.parse(data);

        const targetRoom = db.rooms.getRoomById(indexRoom);

        if (!targetRoom) {
            console.error(`Error: add_user_to_room; targetRoom doesn't exist.`)
            return;
        }

        const roomCreatorPlayerId = targetRoom.roomUsers.at(0)?.index;

        if (roomCreatorPlayerId === undefined) {
            console.error(`Error: add_user_to_room; roomCreatorPlayerId is undefined.`)
            return;
        }

        const roomCreatorWs = socketsMap.get(roomCreatorPlayerId);

        if (!roomCreatorWs) {
            console.error(`Error: add_user_to_room; roomCreatorWs is undefined.`)
            return;
        }

        db.rooms.deleteById(targetRoom.roomId);

        updateRoomsResponse(context)();

        const game = db.games.buildGame({
            [roomCreatorPlayerId]: [],
            [session.getUser().id]: [],
        });

        db.games.add(game);

        createGameResponse(roomCreatorWs, {
            idGame: game.id,
            idPlayer: roomCreatorPlayerId,
        });
        createGameResponse(ws, {
            idGame: game.id,
            idPlayer: session.getUser().id,
        });
    }
};