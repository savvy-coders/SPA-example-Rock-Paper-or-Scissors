import express from "express";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import ShortUniqueId from 'short-unique-id';
import mongoose from "mongoose";

// import rockPaperScissors from "./controllers/rockPaperScissors.js";

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
let players = {};

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
      console.log("Starting a game");

      const response = {
        success: true,
        error: false
      };

      let gameId = new ShortUniqueId({length: 6, dictionary: "alpha"})();
      let playerId = new ShortUniqueId({length: 10, dictionary: "alpha"})();

      if (data.action === 'start') {
        let game = {
          id: gameId,
          players: {}
        }

        game.players[playerId] = {
          name: data.name
        };
        players[playerId] = ws;

        response.type = 'start';
        response.game = gameId;
        response.player = playerId;
        response.message = `Please invite the other player to join using the provided URL`;

        games[gameId] = game;
      }

      if (data.action === 'join') {
        console.log(`Joining game ${data.game}`);

        gameId = data.game;
        games[gameId].players[playerId] = {
          name: data.name
        };
        players[playerId] = ws;

        response.type = 'join';
        response.message = `${data.name} has joined game ${gameId}, please wait for them to make their move.`;
        response.player = playerId;
        response.game = gameId;
      }

      if (data.action === 'move') {
        if (!data.player || !data.game) {
          // Throw an error and warn the user
        }

        gameId = data.game;

        games[gameId].players[data.player].move = data.move;
        console.log('matsinet-games[data.game]', games[data.game]);
        //const moves = games[data.game].players.filter(player => player?.move);
        const moves = [];
        for (const id in games[data.game].players) {
          if (id in games[data.game].players) {
            moves.push(games[data.game].players[id].move);
          }
        }

        console.log('matsinet-moves', moves);

        response.type = 'move';
        if (moves.length > 1) {
          response.game = games[data.game];
          response.message = 'Game complete!'
        } else {
          response.message = 'Waiting for all players to complete their turn!';
        }
      }

      console.log('game', games[gameId]);
      let playerIds = Object.keys(games[gameId].players);

      playerIds.forEach(playerId => {
        if (players[playerId].readyState === WebSocket.OPEN) {
          players[playerId].send(JSON.stringify(response), { binary: isBinary });
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