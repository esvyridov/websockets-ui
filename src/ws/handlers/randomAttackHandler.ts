import { Context } from "../index";
import { attackHandler } from ".";

export function randomAttackHandler(context: Context) {
    return (data: any) => {
        const { gameId, indexPlayer } = JSON.parse(data);

        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);

        attackHandler(context)(JSON.stringify({
            gameId,
            x,
            y,
            indexPlayer
        }));
    }
}