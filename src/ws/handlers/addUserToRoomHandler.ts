import { Context } from "../index";
import { updateRoomsResponse, createGameResponse } from "../responses";
import { doesSessionHaveUser } from "../utils";

export function addUserToRoomHandler(context: Context) {
    const { ws, db, session, socketsMap } = context;
    return (data: any) => {
        if (!doesSessionHaveUser(session)) {
            console.log(`Command - add_user_to_room. Error: Session doesn't have a user.`);
            return;
        }

        const { indexRoom } = JSON.parse(data);

        const targetRoom = db.rooms.getRoomById(indexRoom);

        if (!targetRoom) {
            console.log(`Command - add_user_to_room. Error: A target room doesn't exist.`);
            return;
        }

        const roomCreatorPlayerId = targetRoom.roomUsers.at(0)?.index;

        if (roomCreatorPlayerId === undefined) {
            console.log(`Command - add_user_to_room. Error: Room creator doesn't exist.`);
            return;
        }

        const roomCreatorWs = socketsMap.get(roomCreatorPlayerId);

        if (!roomCreatorWs) {
            console.log(`Command - add_user_to_room. Error: Room creator websocket doesn't exist.`);
            return;
        }

        db.rooms.deleteById(targetRoom.roomId);

        updateRoomsResponse(context)();

        const game = db.games.buildGame({
            [roomCreatorPlayerId]: [],
            [session.getUser().id]: [],
        }, {
            [roomCreatorPlayerId]: [],
            [session.getUser().id]: [],
        }, roomCreatorPlayerId);

        db.games.add(game);

        createGameResponse(roomCreatorWs, {
            idGame: game.id,
            idPlayer: roomCreatorPlayerId,
        });
        createGameResponse(ws, {
            idGame: game.id,
            idPlayer: session.getUser().id,
        });

        console.log(`Command - add_user_to_room. A user has been added to the room. The room was deleted and the game was created. Rooms were updated.`);
    }
};