import { User } from './db';

export type Session = {
    _user: User | undefined;
    setUser(user: User): void;
    getUser(): User | undefined;
    clear(): void;
    getIsUserDefined(): boolean;
}

export type SessionWithUser = Omit<Session, '_user' | 'getUser'> & {
    _user: User;
    getUser(): User;
}

export function createSession(): Session {
    return {
        _user: undefined,
        setUser(user) {
            this._user = user;
        },
        getUser() {
            return this._user;
        },
        clear() {
            this._user = undefined;
        },
        getIsUserDefined() {
            return !!this._user;
        }
    }
}