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

        const currentUser = session.getUser();

        if (db.rooms.getDoesUserHaveRoom(currentUser)) {
            console.log(`Command - create_room. Error: User already has a room.`);
            return;
        }

        db.rooms.add(db.rooms.buildRoom([{
            name: currentUser.name,
            index: currentUser.id,
        }]));

        updateRoomsResponse(context)();
        
        console.log(`Command - create_room. New room for a user ${currentUser.name}:${currentUser.id} has been created. Rooms were updated.`);
    }
};