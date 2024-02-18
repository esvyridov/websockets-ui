import { Session, SessionWithUser } from "./session"

export const doesSessionHaveUser = (session: Session): session is SessionWithUser => {
    return !!session.getIsUserDefined();
}