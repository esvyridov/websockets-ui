import { regResponse, updateRoomsResponse, updateWinnersResponse } from '../responses';
import { Context } from '../index';

export function regHandler(context: Context) {
    const { ws, db, session, socketsMap } = context;
    return (data: any) => {
        const { name, password } = JSON.parse(data);
        const existedUser = db.users.getByName(name);
    
        if (name.length < 5 || password.length < 5) {
            regResponse(ws, {
                error: true,
                errorText: 'Provided name or password is less than 5 characters.',
            });

            console.log(`Command - reg. Error: Provided name or password is less than 5 characters.`);
            return;
        }

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

            console.log(`Command - reg. New user ${newUser.name}:${newUser.id} has been created. Rooms and winners were updated.`);
    
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

            console.log(`Command - reg. Existed user ${existedUser.name}:${existedUser.id} logged in successfully. Rooms and winners for all active users were updated.`);
            return 
        }
        
        regResponse(ws, {
            error: true,
            errorText: 'Name or password is incorrect.',
        });

        console.log(`Command - reg. Error: ${existedUser.name}:${existedUser.id}'s password doesn't match with provided password.`);
    }
}

