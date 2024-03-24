import { Position, Ship } from "./db";
import { Session, SessionWithUser } from "./session";

export const BOT_ID = -1;

export const sleep = () => new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

export function doesSessionHaveUser(session: Session): session is SessionWithUser {
    return !!session.getIsUserDefined();
}

export function getShipCoordinates(ship: Ship): Position[] {
    if (ship.direction) {
        return new Array(ship.length).fill(undefined).map((_, index) => ({ x: ship.position.x as number, y: (ship.position.y as number) + index }));
    }

    return new Array(ship.length).fill(undefined).map((_, index) => ({ x: (ship.position.x as number) + index, y: ship.position.y as number }));
}

export function getShipAroundCoordinates(ship: Ship): {x: number, y: number}[] {
    const coordinates = getShipCoordinates(ship);
    const aroundCoordinates: Position[] = [];
    const firstCoodinate = coordinates[0];
    const lastCoordinate = coordinates[coordinates.length - 1];

    if (ship.direction) {
        aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
            x: firstCoodinate.x + value,
            y: firstCoodinate.y - 1,
        })));
        
        coordinates.forEach((coordinate) => {
            aroundCoordinates.push(...[-1, 1].map((value) => ({
                x: coordinate.x + value,
                y: coordinate.y,
            })))
        })

        aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
            x: lastCoordinate.x + value,
            y: lastCoordinate.y + 1,
        })));

        return aroundCoordinates;
    }

    aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
            x: firstCoodinate.x - 1,
            y: firstCoodinate.y + value,
        })));
    
    coordinates.forEach((coordinate) => {
        aroundCoordinates.push(...[-1, 1].map((value) => ({
            x: coordinate.x,
            y: coordinate.y + value,
        })))
    })

    aroundCoordinates.push(...[-1, 0, 1].map((value) => ({
        x: lastCoordinate.x + 1,
        y: lastCoordinate.y + value,
    })));

    return aroundCoordinates;
}