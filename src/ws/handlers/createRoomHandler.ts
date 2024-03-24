import { Context } from "../index";
import { updateRoomsResponse } from "../responses";
import { doesSessionHaveUser } from "../utils";

export function createRoomHandler(context: Context) {
    const { db, session } = context;
    return () => {
        if (!doesSessionHaveUser(session)) {
            console.log(`Command - create_room. Error: Session doesn't have a user.`);
            return;
        }

        const user = session.getUser();

        if (db.rooms.getDoesUserHaveRoom(user)) {
            console.log(`Command - create_room. Error: User already has a room.`);
            return;
        }

        db.rooms.add(db.rooms.buildRoom([{
            name: user.name,
            index: user.id,
        }]));

        updateRoomsResponse(context)();
        
        console.log(`Command - create_room. New room for a user ${user.name}:${user.id} has been created. Rooms were updated.`);
    }
};