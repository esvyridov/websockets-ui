import { Context } from "../index";

export function updateRoomsResponse({ db, socketsMap}: Context) {
    return () => {
        const roomsWithOnePlayer = db.rooms.getRoomsWithOneUser();

        socketsMap.forEach((ws) => {
            ws.send(JSON.stringify({
                type: 'update_room',
                data: JSON.stringify(roomsWithOnePlayer),
                id: 0,
            }));
        }); 
    }
}