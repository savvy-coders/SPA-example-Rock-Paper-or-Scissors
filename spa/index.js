import { footer, header, main, nav, notification } from "./components";
import * as store from "./store";
import axios from "axios";
import Navigo from "navigo";
import {camelCase} from "lodash";
import ShortUniqueId from 'short-unique-id';

const router = new Navigo("/");

function render(state = store.home, gameData = store.game) {
  document.querySelector("#slot").innerHTML = `
    ${header(state)}
    ${notification(store.notification)}
    ${nav(store.nav)}
    ${main(state, gameData)}
    ${footer()}
  `;

  router.updatePageLinks();

  //afterRender(state);
}

function updateNotification() {
  // Hide the notification component if it is visible and not dismissible
  if (store.notification.visible && store.notification.dismissable === false) {
    if (store.notification.showCount >= 1) {
      // Hide the notification after it has been shown once
      store.notification.visible = false;
      store.notification.showCount = 0;
    } else {
      store.notification.showCount += 1;
    }
  }
}

function setupConnection(type, name) {
  let connection = new WebSocket(`${process.env.GAME_API_URL}/game`);
  connection.onopen = (event) => {
    const gameRequest = {
      action: false,
      name
    };
    switch (type) {
      case 'start':
        gameRequest.action = 'start';
        break;
      case 'join':
        gameRequest.action = 'join';
        gameRequest.game = store.move.game;
        break;
    }
    console.log('matsinet-gameRequest', gameRequest);
    if (gameRequest.action) {
      connection.send(JSON.stringify(gameRequest));
    }
  }

  connection.onclose = (event) => {};

  connection.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'start':
        store.game.players.player1.name = name;
        store.rockPaperScissors.name = name;
        store.game.id = data.game;
        store.rockPaperScissors.player = data.player;
        store.rockPaperScissors.hasOpponent = false;
        store.rockPaperScissors.isAgainstComputer = false;
        store.rockPaperScissors.message = `${data.message}: <a href="${location.origin}/join?game=${data.game}">${data.game}</a>`;
        break;
      case 'join':
        store.game.id = data.game;
        store.game.players[data.player] = {
          name,
          id: data.player
        };
        store.rockPaperScissors.hasOpponent = true;
        store.rockPaperScissors.isAgainstComputer = false;
        store.move.message = data.message;
        break;
      case 'play':
        store.game.players[data.player].hand = data.hand;
        break;
    }

    router.navigate('/move');
  };

  return connection;
}

router.hooks({
  // Use object deconstruction to store the data and (query)params from the Navigo match parameter
  // Runs before a route handler that the match is hasn't been visited already
  before: async (done, { data, params }) => {
    // Check if data is null, view property exists, if not set view equal to "home"
    // using optional chaining (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
    const view = data?.view ? camelCase(data.view) : "home";

    updateNotification();

    // Add a switch/case statement to handle multiple routes
    // Use a switch/case since we must execute done() regardless of the view being requested
    switch (view) {
      // Run this code if the home view is requested
      case "home": {
        const kelvinToFahrenheit = kelvinTemp => Math.round((kelvinTemp - 273.15) * (9 / 5) + 32);

        try {
          const positionResponse = await new Promise((resolve, reject) => {
            const options = {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }

            return navigator.geolocation.getCurrentPosition(resolve, reject, options);
          });

          const location = {latitude: positionResponse.coords.latitude, longitude: positionResponse.coords.longitude};

          const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/reverse?lat=${location.latitude}8&lon=${location.longitude}&limit=3&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`);

          const city = geoResponse.data[0];

          const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&q=${city.name},${city.state}`);

          store.home.weather = {
            city: weatherResponse.data.name,
            temp: kelvinToFahrenheit(weatherResponse.data.main.temp),
            feelsLike: kelvinToFahrenheit(weatherResponse.data.main.feels_like),
            description: weatherResponse.data.weather[0].main
          };

          done();
        } catch(error) {
          console.error("Error retrieving weather data", error);

          store.notification.type = "error";
          store.notification.visible = true;
          store.notification.message = "Error retrieving weather data";

          done();
        }
        break;
      }
      // Run this code if the view is not listed above
      case "join":
        if (params.gameId) {
          store.game.id = params.gameId;
        }
        done();
        break;
      default: {
        done();
      }
    }
  },
  // Runs before a route handler that is already the match is already being visited
  already: ({ data, params }) => {
    const view = data?.view ? camelCase(data.view) : "home";

    updateNotification();

    render(store[view]);
  },
  after:  async ({data}) => {
    const view = data?.view ? camelCase(data.view) : "home";
    const playerId = data.playerId ? data.playerId : "";
    const state = store[view];

    // Add menu toggle to bars icon in nav bar which is rendered on every page
    document
      .querySelector(".fa-bars")
      .addEventListener("click", () =>
        document.querySelector("nav > ul").classList.toggle("hidden--mobile")
      );

    document.getElementById('notification').addEventListener('close', event => {
      store.notification.visible = false;
      store.notification.showCount = 0;
    });

    switch (view) {
      case "home":
        document.getElementById('action-button').addEventListener('click', event => {
          event.preventDefault();

          alert('Hello! You clicked the action button! Redirecting to the pizza view');

          location.href = 'https://www.google.com';
        });
        break;
      case "rockPaperScissors":
        document.querySelector('#computerGame').addEventListener("click", event => {
          event.preventDefault();

          // let gameId = new ShortUniqueId({length: 6, dictionary: "alpha"})();
          let playerId = new ShortUniqueId({length: 10, dictionary: "alpha"})();

          store.game.players[playerId] = {
            name: document.querySelector('#name').value,
            id: playerId,
            hand: ""
          };
          // store.rockPaperScissors.name = name;
          store.game.hasOpponent = true;
          store.game.isAgainstComputer = true;
          store.game.message = "Please select your move as the computer is choosing it's move."

          router.navigate(`/move/${playerId}`);
        });

        document.querySelector('#opponentGame').addEventListener("click", async event => {
          event.preventDefault();

          store.game.socket = setupConnection('start', document.querySelector('#name').value);
        });
        break;
      case "join":
        document.querySelector('#joinGame').addEventListener('click', async event => {
          event.preventDefault();

          let playerId = new ShortUniqueId({length: 10, dictionary: "alpha"})();

          store.game.players[playerId] = {
            name: document.querySelector('#name').value,
            id: playerId,
            hand: ""
          };

          store.game.socket = setupConnection('join', name);
        });
        break;
      case "move":
        document.querySelectorAll('.choices .hand').forEach(hand => {
          hand.addEventListener('click', event => {
            // Set the player 1 name
            // Set the player 1 hand from the selected button
            const hand = event.target.dataset.hand;
            store.game.players[playerId].hand = hand

            if (store.game.isAgainstComputer) {
              // Get the list of hands
              const hands = Object.keys(store.game.hands);
              // Set computer to a random hand
              store.game.players['computer'] = {
                id: 'computer',
                name: 'Computer',
                hand: hands[(Math.floor(Math.random() * hands.length))]
              };

            } else {
              // Send move message to connection
              const moveRequest = {
                action: "move",
                game: store.game.id,
                move: store.game.players[playerId].hand
              };

              store.game.socket.send(moveRequest);
            }

            // Determine who won
            let whoWonOutput = "";

            for ( let player in store.game.players) {
              console.log(player);
            }
            // if (store.results.player1.hand === store.results.player2.hand) {
            //   whoWonOutput = "It's a tie, nobody wins this round.";
            // } else if (store.results.hands[store.results.player1.hand] === store.results.player2.hand) {
            //   whoWonOutput = `${store.results.player1.name} wins this round, with a ${store.results.player1.hand} beating a ${store.results.player2.hand}`;
            // } else {
            //   whoWonOutput = `${store.results.player2.name} wins this round, with a ${store.results.player2.hand} beating a ${store.results.player1.hand}`;
            // }
            store.rockPaperScissors.won = whoWonOutput;
            store.rockPaperScissors.message = whoWonOutput;

            router.navigate(`/results/${playerId}`);
          });
        });
        break;
      case "results":
        store.game.id = "";
        store.game.won = "";
        store.game.message = "";
        store.game.isAgainstComputer = false;
        store.game.hasOpponent = false;

        document.querySelector('#newGame').addEventListener("click", event => {
          event.preventDefault();

          if (store.game.socket) {
            store.game.socket.destroy();
          }

          store.game.players = {};

          router.navigate(`/rock-paper-scissors`)
        });

        document.querySelector('#playAgain').addEventListener("click", event => {
          event.preventDefault();

          store.game.players[playerId].hand = "";
          store.game.players['computer'].hand = "";

          router.navigate(`/move/${playerId}`)
        });
        break;
    }
  }
});

router
  .on({
    "/": () => render(),
    // Use object destructuring assignment to store the data and (query)params from the Navigo match parameter
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
    // This reduces the number of checks that need to be performed
    ":view": ({ data, params }) => {
      // Change the :view data element to camel case and remove any dashes (support for multi-word views)
      const view = data?.view ? camelCase(data.view) : "home";
      if (view in store) {
        render(store[view]);
      } else {
        console.log(`View ${view} not defined`);
        render(store.viewNotFound);
      }
    },
    ":view/:playerId": ({ data, params }) => {
      // Change the :view data element to camel case and remove any dashes (support for multi-word views)
      const view = data?.view ? camelCase(data.view) : "home";
      if (view in store) {
        render(store[view]);
      } else {
        console.log(`View ${view} not defined`);
        render(store.viewNotFound);
      }
    }
  })
  .resolve();