import { Context } from "../index";
import { createGameResponse } from "../responses";
import { BOT_ID, doesSessionHaveUser } from "../utils";

export function singlePlayHandler(context: Context) {
    const { db, session, socketsMap } = context;
    return (data: any) => {
        if (!doesSessionHaveUser(session)) {
            console.log(`Command - single_play. Error: Session doesn't have a user.`);
            return;
        }

        const user = session.getUser();

        const userWs = socketsMap.get(user.id);

        if (!userWs) {
            console.log(`Command - single_play. Error: User doesn't have active websocket.`);
            return;
        }

        const game = db.games.buildGame({
            [user.id]: [],
            [BOT_ID]: [],
        }, {
            [user.id]: [],
            [BOT_ID]: [],
        });

        db.games.add(game);

        createGameResponse(userWs, {
            idGame: game.id,
            idPlayer: user.id,
        });
    }
}