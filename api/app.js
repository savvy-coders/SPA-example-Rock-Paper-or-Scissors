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

      const gameUid = new ShortUniqueId({length: 6});
      const playerUid = new ShortUniqueId({length: 10});

      let gameId = gameUid();
      let playerId = playerUid();

      if (data.action === 'start') {
        let game = {
          id: gameId,
          players: {}
        }

        game.players[playerId] = {
          name: data.name
        };
        players[playerId] = ws;

        response.game = gameId;
        response.url = `/game/${gameId}`;
        response.player = playerId;

        games[gameId] = game;
      }

      if (data.action === 'join') {
        console.log(`Joining game ${data.game}`);

        gameId = data.game;
        games[gameId].players[playerId] = {
          name: data.name
        };
        players[playerId] = ws;

        response.status = `${data.name} has joined game ${gameId}`;
        response.player = playerId;
        response.game = gameId;
      }

      if (data.action === 'play') {
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
    }

    if (request.url === '/message') {
      if (!'player' in data || data.player === 'all') {
        // Send message to all players
        wsServer.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data.message || "Hello World!", { binary: isBinary });
          }
        });
      } else {

      }
    }
  });

  ws.on('close', () => {
    console.log('Connection Closed');
  });
});