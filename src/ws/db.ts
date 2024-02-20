export type User = {
    id: number;
    name: string;
    password: string;
}

export type Position = {
    x: number;
    y: number;
}

type RoomUser = {
    name: string;
    index: number;
}

type Room = {
    roomId: number;
    roomUsers: RoomUser[];
}

export type Ship = {
    position: Position;
    direction: boolean;
    length: number;
    type: 'small' | 'medium' | 'large' | 'huge';
    _health: number;
}

type Game = {
    id: number;
    players: Record<number, Ship[]>;
    _shots: Record<number, Position[]>;
}

type Winner = {
    name: string;
    wins: number;
}

type UserRepository = {
    _data: User[];
    _nextUserId: number;
    getByName(name: string): User | undefined;
    getById(id: number): User | undefined;
    buildUser(name: string, password: string): User;
    add(user: User): void;
}

type RoomRepository = {
    _data: Room[];
    _nextRoomId: number;
    getRooms(): Room[];
    getRoomById(id: number): Room | undefined;
    getRoomsWithOneUser(): Room[];
    getDoesUserHaveRoom(user: User): boolean;
    buildRoom(roomUsers: RoomUser[]): Room;
    add(room: Room): void;
    deleteById(index: number): void;
    deleteByUserId(userId: number): void;
}

type GameRepository = {
    _data: Game[];
    _nextGameId: number;
    getGameById(id: number): Game | undefined;
    buildGame(players: Record<number, Ship[]>, shots: Record<number, Position[]>): Game;
    add(game: Game): void;
    updateShips(id: number, playerId: number, ships: Ship[]): void;
    addShot(id: number, playerId: number, shot: Position): void;
    addShots(id: number, playerId: number, shot: Position[]): void;
    updateShipHealth(id: number, playerId: number, ship: Ship): void;
    isGameReadyToStart(id: number): boolean;
    deleteById(gameId: number): void;
}

type WinnerRepository = {
    _data: Winner[];
    getWinners(): Winner[];
    addWin(id: string): void;
}

export type DB = {
    users: UserRepository;
    rooms: RoomRepository;
    games: GameRepository;
    winners: WinnerRepository;
}

export function createDB(): DB {
    return {
        users: {
            _data: [],
            _nextUserId: 0,
            getByName(name) {
                return this._data.find((user) => user.name === name);
            },
            getById(id) {
                return this._data.find((user) => user.id === id);  
            },
            buildUser(name, password) {
                this._nextUserId++;
                return {
                    id: this._nextUserId,
                    name,
                    password
                }
            },
            add(user) {
                this._data.push(user);
            }
        },
        rooms: {
            _data: [],
            _nextRoomId: 0,
            getRooms() {
                return this._data;
            },
            getRoomById(id: number) {
                return this._data.find((room) => room.roomId === id);
            },
            getRoomsWithOneUser() {
                return this._data.filter((room) => room.roomUsers.length === 1)
            },
            getDoesUserHaveRoom(user) {
                return this._data.some((room) => room.roomUsers.some((roomUser) => roomUser.index === user.id));
            },
            buildRoom(roomUsers: RoomUser[]) {
                this._nextRoomId++;
                return {
                    roomId: this._nextRoomId,
                    roomUsers,
                }
            },
            add(room) {
                this._data.push(room);
            },
            deleteByUserId(userId) {
                this._data = this._data.filter((room) => !room.roomUsers.some((user) => user.index === userId));
            },
            deleteById(roomId: number) {
                this._data = this._data.filter((room) => room.roomId !== roomId);
            }
        },
        games: {
            _data: [],
            _nextGameId: 0,
            getGameById(id) {
                return this._data.find((game) => game.id === id);
            },
            buildGame(players, shots) {
                this._nextGameId++;
                return {
                    id: this._nextGameId,
                    players,
                    _shots: shots,
                }
            },
            add(game) {
                this._data.push(game);
            },
            updateShips(id, playerId, ships) {
                this._data = this._data.map((game) => {
                    if (game.id === id) {
                        return {
                            ...game,
                            players: {
                                ...game.players,
                                [playerId]: ships,
                            }
                        }
                    }

                    return game;
                })
            },
            addShot(id, playerId, shot) {
                this._data = this._data.map((game) => {
                    if (game.id === id) {
                        return {
                            ...game,
                            _shots: {
                                ...game._shots,
                                [playerId]: [...game._shots[playerId], shot],
                            }
                        }
                    }

                    return game;
                });
            },
            addShots(id, playerId, shots) {
                this._data = this._data.map((game) => {
                    if (game.id === id) {
                        return {
                            ...game,
                            _shots: {
                                ...game._shots,
                                [playerId]: [...game._shots[playerId], ...shots],
                            }
                        }
                    }

                    return game;
                });
            },
            updateShipHealth(id, playerId, ship) {
                this._data = this._data.map((game) => {
                    if (game.id === id) {
                        return {
                            ...game,
                            players: {
                                ...game.players,
                                [playerId]: game.players[playerId].map((s) => {
                                    if (s === ship) {
                                        return {
                                            ...s,
                                            _health: s._health - 1,
                                        }
                                    }

                                    return s;
                                })
                            }
                            
                        }
                    }

                    return game;
                })
            },
            isGameReadyToStart(id) {
                const game = this._data.find((game) => game.id === id);

                if (!game) {
                    return false;
                }

                return Object.values(game.players).every((ships) => ships.length > 0);
            },
            deleteById(gameId) {
                this._data = this._data.filter((game) => game.id !== gameId);
            }
        },
        winners: {
            _data: [],
            getWinners() {
                return this._data;
            },
            addWin(name) {
                const winner = this._data.find((winner) => winner.name === name);

                if (winner) {
                    winner.wins++;
                } else {
                    this._data.push({
                        name,
                        wins: 1,
                    })
                }
            }
        }
    };
}