import { Context } from "../index";
import { updateRoomsResponse, updateWinnersResponse } from "../responses";
import { doesSessionHaveUser } from "../utils";

export function createRoomHandler(context: Context) {
    const { db, session } = context;
    return () => {
        if (!doesSessionHaveUser(session)) {
            console.error(`Error: create_room; currentPlayer is undefined.`)
            return;
        }

        const currentUser = session.getUser();

        if (db.rooms.getDoesUserHaveRoom(currentUser)) {
            console.error(`Error: create_room; currentPlayer already has a room.`)
            return;
        }

        db.rooms.add(db.rooms.buildRoom([{
            name: currentUser.name,
            index: currentUser.id,
        }]));

        updateRoomsResponse(context)();
        updateWinnersResponse(context)();
    }
};