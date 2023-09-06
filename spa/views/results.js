import html from "html-literal";
import * as images from "../assets/img";
import "../assets/css/views/results.css";

function outputCompletedGame(gameData) {
  if (gameData.complete) {
    return html`<div class="hands">${Object.values(gameData.players).map(player => {
      return html`<div id = "player1" class="hand">
          <h2>${player.name}</h2>
          <img src="${images[player.hand]}" alt="player 1 hand">
        </div>`;
    }).join("")}</div>
    <div class="controls">
      <div id="newGame" class="button">New Game</div>
      <div id="playAgain" class="button">Play Again</div>
    </div>`;
  }
}

export default (state, gameData) => html`
  <div class="game">
    <div class="message">${gameData.message}</div>
    ${outputCompletedGame(gameData)}
  </div>
`;