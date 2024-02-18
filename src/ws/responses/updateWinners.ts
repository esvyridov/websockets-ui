import { Context } from "../index";

export function updateWinnersResponse({ db, socketsMap }: Context) {
    return () => {
        socketsMap.forEach((ws) => {
            ws.send(JSON.stringify({
                type: 'update_winners',
                data: JSON.stringify(db.winners.getWinners()),
            }))
        });
    }
    
}