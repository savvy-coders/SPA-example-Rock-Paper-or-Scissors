import express from "express";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import ShortUniqueId from 'short-unique-id';

dotenv.config();

const app = express();

// Logging Middleware Declaration
const logging = (request, response, next) => {
  console.log(`${request.method} ${request.url} ${Date.now()}`);
  next();
};

// CORS Middleware Declaration
const cors = (req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Accept,Authorization,Origin"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

// Use the defined Middleward
app.use(cors);
app.use(express.json());

// Define a status route
app.get("/status", (request, response) => {
  response.send(JSON.stringify({ message: "Service running ok" }));
});

// Moving the logging middleware to this location so that the logs on render.com are not filled up with status checks
app.use(logging);

const PORT = process.env.PORT || 4040;
const apiServer = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const wsServer = new WebSocketServer({ noServer: true });

let games = {};
let playerWss = {};

function onSocketPreError(error) {
  console.log(error);
}

function onSocketPostError(error) {
  console.log(error);
}

apiServer.on('upgrade', (request, socket, head) => {
  socket.on('error', onSocketPreError);

  wsServer.handleUpgrade(request, socket, head, (ws) => {
    socket.removeListener('error', onSocketPreError);
    wsServer.emit('connection', ws, request);
    console.log('Connection Upgraded');
  });
});

wsServer.on('connection', (ws, request) => {
  console.log('Connection Opened');
  console.log('Request.url: ', request.url);
  wsServer.on('error', onSocketPostError);

  ws.on('message', (message, isBinary) => {
    const data = JSON.parse(message);
    console.log('Message Received!', data);

    if (request.url.includes('/game')) {
      const response = {
        success: true,
        error: false
      };

      let gameId = new ShortUniqueId({length: 6, dictionary: "alpha"})();

      if (data.action === 'start') {
        console.log("Starting a game");
        const playerId = new ShortUniqueId({length: 10, dictionary: "alpha"})();

        let game = {
          id: gameId,
          players: {}
        }

        game.players[playerId] = {
          name: data.name
        };
        playerWss[playerId] = ws;

        response.type = 'start';
        response.game = gameId;
        response.player = playerId;
        response.name = data.name;
        response.message = `Please invite the other player to join using the provided URL`;

        games[gameId] = game;

        games[gameId].players[playerId].response = response;
      }

      if (data.action === 'join') {
        gameId = data.game;
        const playerId = new ShortUniqueId({length: 10, dictionary: "alpha"})();
        const otherPlayerId = Object.keys(games[gameId].players).find(player => player !== playerId);

        if (data.game in games) {
          games[gameId].players[playerId] = {
            name: data.name
          };
          playerWss[playerId] = ws;
        } else {
          // response.type = 'join';
          // response.message = `Can not join game ${gameId}, as it does not exist.`;
          // response.player = playerId;
          // response.game = gameId;
          // response.error = true;
        }

        games[gameId].players[playerId].response = {
          type: 'join',
          game: gameId,
          message: `Please select your move, wait for ${games[gameId].players[otherPlayerId].name} to make their move.`,
          player: playerId,
          name: data.name,
          otherPlayer: {
            id: otherPlayerId,
            name: games[gameId].players[otherPlayerId].name
          }
        }

        games[gameId].players[otherPlayerId].response = {
          type: 'join',
          game: gameId,
          message: `${games[gameId].players[playerId].name} has joined the game (${gameId}) and is waiting for you.`,
          player: otherPlayerId,
          otherPlayer: {
            id: playerId,
            name: games[gameId].players[playerId].name
          }
        };
      }

      if (data.action === 'move') {
        if (!data.player || !data.game) {
          // Throw an error and warn the user
        }

        const gameId = data.game;
        const playerId = data.player;

        console.log('matsinet - start move- games[gameId].players:', games[gameId].players);

        games[gameId].players[playerId].move = data.move;
        console.log('matsinet-games[data.game]', games[data.game]);
        //const moves = games[data.game].players.filter(player => player?.move);
        const moves = [];
        for (const id in games[gameId].players) {
          if (id in games[gameId].players && 'move' in games[data.game].players[id]) {
            moves.push(games[gameId].players[id].move);
          }
        }

        console.log('matsinet-moves', moves);

        const otherPlayerId = Object.keys(games[gameId].players).find(player => player !== playerId);

        if (moves.length > 1) {
          let whoWonOutput = "TBD";

          // if (store.results.player1.hand === store.results.player2.hand) {
          //   whoWonOutput = "It's a tie, nobody wins this round.";
          // } else if (store.results.hands[store.results.player1.hand] === store.results.player2.hand) {
          //   whoWonOutput = `${store.results.player1.name} wins this round, with a ${store.results.player1.hand} beating a ${store.results.player2.hand}`;
          // } else {
          //   whoWonOutput = `${store.results.player2.name} wins this round, with a ${store.results.player2.hand} beating a ${store.results.player1.hand}`;
          // }

          games[gameId].players[playerId].response = {
            type: 'move',
            player: playerId,
            game: gameId,
            move: data.move,
            message: whoWonOutput,
            complete: true
          }
  
          games[gameId].players[otherPlayerId].response = {
            type: 'move',
            player: playerId,
            game: gameId,
            move: data.move,
            message: whoWonOutput,
            complete: true
          };
        } else {
          console.log('matsinet- before move message - games[gameId].players:', games[gameId].players);
          
          games[gameId].players[playerId].response = {
            type: 'move',
            player: playerId,
            game: gameId,
            move: data.move,
            message: `Please wait for ${games[gameId].players[otherPlayerId].name} to complete their turn!`,
            complete: false
          }
  
          games[gameId].players[otherPlayerId].response = {
            type: 'move',
            player: playerId,
            game: gameId,
            move: data.move,
            message: `${games[gameId].players[playerId].name} is waiting for you to complete your turn!`,
            complete: false
          };

          console.log('matsinet - after move message- games[gameId].players:', games[gameId].players);
        }
      }

      gameId = data.game || gameId;
      console.log('matsinet-wsSend-gameId', gameId);
      let playerIds = Object.keys(games[gameId].players);
      playerIds.forEach(id => {
        console.log('matsinet-playerId', id);
        if (playerWss[id] && playerWss[id].readyState === WebSocket.OPEN && games[gameId].players[id].response) {
          playerWss[id].send(JSON.stringify(games[gameId].players[id].response), { binary: isBinary });
          console.log(`Sent messaage '${games[gameId].players[id].response.message}' to ${id}`);
          playerWss[id].response = false;
        }
      });

      //if (data.action === 'message') {
      //  if (!'player' in data || data.player === 'all') {
      //    // Send message to all players
      //    wsServer.clients.forEach(client => {
      //      if (client.readyState === WebSocket.OPEN) {
      //        client.send(data.message, {binary: isBinary});
      //      }
      //    });
      //  } else {
      //    if (data.player in players) {
      //      const playerSocket = players[data.player];
      //      const jsonData = {
      //        action: 'message',
      //        message: data.message
      //      };
      //      playerSocket.send(JSON.stringify(jsonData));
      //    } else {
      //      ws.send(`User ${data.player} not found, please try again`);
      //    }
      //  }
      //}
    }
  });

  ws.on('close', () => {
    console.log('Connection Closed');
  });
});