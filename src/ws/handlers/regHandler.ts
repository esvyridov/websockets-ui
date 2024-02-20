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

            console.log(`Command - reg. New user ${newUser.name}:${newUser.id} has been created.`);
            console.log(`Command - reg. Side effects: Rooms update, Winners update.`);
    
            return;
        }
    
        if (socketsMap.has(existedUser.id)) {
            console.log(`Command - reg. Error: User ${existedUser.name}:${existedUser.id} is already logged in.`);

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

            console.log(`Command - reg. Existed user ${existedUser.name}:${existedUser.id} logged in successfully.`);
            console.log(`Command - reg. Side effects: Rooms update, Winners update.`);
            return 
        }
        
        regResponse(ws, {
            error: true,
            errorText: 'Name or password is incorrect.',
        });

        console.log(`Command - reg. Error: ${existedUser.name}:${existedUser.id}'s password doesn't match with provided password.`);
    }
}

