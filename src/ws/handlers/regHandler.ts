import { regResponse, updateRoomsResponse, updateWinnersResponse } from '../responses';
import { Context } from '../index';

export function regHandler(context: Context) {
    const { ws, db, session, socketsMap } = context;
    return (data: any) => {
        const { name, password } = JSON.parse(data);
        const existedUser = db.users.getByName(name);
    
        if (!existedUser) {
            const newUser = db.users.buildUser(name, password);

            session.setUser(newUser);

            db.users.add(newUser);
    
            socketsMap.set(newUser.id, ws);
    
            regResponse(ws, {
                index: newUser.id,
                name: newUser.name,
                error: false,
            });
            updateRoomsResponse(context)();
            updateWinnersResponse(context)();
    
            return;
        }
    
        if (socketsMap.has(existedUser.id)) {
            regResponse(ws, {
                error: true,
                errorText: 'This player is already logged in.',
            });
            return;
        }
    
        if (existedUser.password === password) {
            session.setUser(existedUser);
    
            socketsMap.set(existedUser.id, ws);
    
            regResponse(ws, {
                index: existedUser.id,
                name: existedUser.name,
                error: false,
            });
            updateRoomsResponse(context)();
            updateWinnersResponse(context)();
            return 
        }
    
        regResponse(ws, {
            error: true,
            errorText: 'Name or password is incorrect.',
        });
    }
}

