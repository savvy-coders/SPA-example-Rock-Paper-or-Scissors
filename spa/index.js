import { header, nav, main, footer, notification } from "./components";
import * as store from "./store";
import axios from "axios";
import Navigo from "navigo";
import { camelCase } from "lodash";

let PIZZA_PLACE_API_URL;

const router = new Navigo("/");

function render(state = store.home) {
  document.querySelector("#root").innerHTML = `
    ${header(state)}
    ${notification(store.notification)}
    ${nav(store.nav)}
    ${main(state)}
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

    // Run this code if the home view is requested
    if (view === "home") {
      document.getElementById('action-button').addEventListener('click', event => {
        event.preventDefault();

        alert('Hello! You clicked the action button! Redirecting to the pizza view');

        location.href = 'https://www.google.com';
      });
    }

    if (view === "rockPaperScissors") {
      document.querySelector('#computerGame').addEventListener("click", event => {
        event.preventDefault();

        const name = document.querySelector('#name').value;
        store.results.player1.name = name;
        store.rockPaperScissors.name = name;

        router.navigate('/move')
      });

      document.querySelector('#opponentGame').addEventListener("click", event => {
        event.preventDefault();

        const name = document.querySelector('#name').value;
        store.results.player1.name = name;
        store.rockPaperScissors.name = name;

        router.navigate('/move')
      });
    }

    if (view === "move") {
      document.querySelectorAll('.choices .hand').forEach(hand => {
        hand.addEventListener('click', event => {
          // Set the player 1 name
          // Set the player 1 hand from the selected button
          store.results.player1.hand = event.target.dataset.hand;
          // Get the list of hands
          const hands = Object.keys(store.results.hands);
          // Set computer to a random hand
          store.results.player2.hand = hands[(Math.floor(Math.random() * hands.length))];
          // Determine who won
          let whoWonOutput = "";
          if (store.results.player1.hand === store.results.player2.hand) {
            whoWonOutput = "It's a tie, nobody wins this round.";
          } else if (store.results.hands[store.results.player1.hand] === store.results.player2.hand) {
            whoWonOutput = `${store.results.player1.name} wins this round, with a ${store.results.player1.hand} beating a ${store.results.player2.hand}`;
          } else {
            whoWonOutput = `${store.results.player2.name} wins this round, with a ${store.results.player2.hand} beating a ${store.results.player1.hand}`;
          }
          store.results.won = whoWonOutput;
          router.navigate('/results');
        });
      });
    }

    if (view === "results") {
      document.querySelector('#newGame').addEventListener("click", event => {
        event.preventDefault();

        store.results.player1 = {
          name: "Player 1",
          hand: ""
        };
        store.results.player2 = {
          name: "Computer",
          hand: ""
        };

        router.navigate('/rock-paper-scissors')
      });
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
    }
  })
  .resolve();