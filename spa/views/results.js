import html from "html-literal";
import * as images from "../assets/img";
import "../assets/css/views/results.css";

function outputPlayers(gameData) {
  return Object.values(gameData.players).map(player => {
    return `<div id="player1" class="hand">
      <h2>${player.name}</h2>
      <img src="${images[player.hand]}" alt="player 1 hand">
    </div>`;
  }).join("");
}

export default (state, gameData) => html`
<div class="game">
  <div class="hands">${outputPlayers(gameData)}</div>
  <h2>${state.won}</h2>
  <div class="controls">
    <div id="newGame" class="button">New Game</div>
    <div id="playAgain" class="button">Play Again</div>
  </div>
</div>
`;