# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.

## Gameplay

*Registration*

- Name and password must be longer or equal than 5 characters.
- If a user exists in the users array, then, in order to successfully log in, the entered password should match with the one that was saved in the DB.
- User can't login to the same user profile using different tabs / browsers meaning that a user may have only one unique websocket connection.

*Room*

- A user can't create a room if he/she already has the room.
- A user can't join to the room that he/she created.
- A user is added to the room automatically after he/she click on "Create room" button.
- A room is removed after a game is started.
- If two users have own room at the same time and one of them joins a room of another one, both rooms are deleted.
- If a user has room and disconnects from the server, then the user's room is deleted.

*Game*
- A game starts when a room has two users.
- A game is deleted after the game has a winner.
- If a user shoots in the same place twice, then next turn goes to another user.
- If a user is in the game and disconnects from the server, then his/her rival gets the win.

*Bot*
- The bot shoots every .5s randomly when it's bot's turn. A shot is unique meaning that the bot can't shoot in the same place twice.
- The bot isn't shown in the Winners list.

## Logs

I added logs to almost all events that happen on the server. If something doesn't work as you expected, please check the logs, maybe you'll be able to find out what is going on. Thank you!