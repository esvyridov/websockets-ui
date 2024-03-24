import { Context } from "../index";
import { attackHandler } from ".";

export function randomAttackHandler(context: Context) {
    const { db } = context;
    return (data: any) => {
        const { gameId, indexPlayer } = JSON.parse(data);

        const targetGame = db.games.getGameById(gameId);

        if (!targetGame) {
            console.log(`Command - randomAttack. Error: Game with ${gameId} doesn't exist.`);
            return;
        }

        const indexPlayerShots = targetGame._shots[indexPlayer];

        if (indexPlayerShots === undefined) {
            console.log(`Command - randomAttack. Error: Index player shots lis doesn't exist.`);
            return;
        }

        let x: number;
        let y: number;

        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
        }
        while (indexPlayerShots.some((shot) => shot.x === x && shot.y === y))

        console.log(`Command - randomAttack. Player ${indexPlayer} used a random attack. Coordinates - ${x}:${y}.`);

        attackHandler(context)(JSON.stringify({
            gameId,
            x,
            y,
            indexPlayer
        }));
    }
}