import html from "html-literal";
import * as images from "../assets/img";
import "../assets/css/views/results.css";

export default (state) => html`
<div class="game">
  <div class="hands">
    <div id="player1" class="hand">
      <h2>${state.player1.name}</h2>
      <img src="${images[state.player1.hand]}" alt="player 1 hand">
    </div>
    <div id="player2" class="hand">
      <h2>${state.player2.name}</h2>
      <img src="${images[state.player2.hand]}" alt="player 2 hand">
    </div>
  </div>
  <h2>${state.won}</h2>
  <div id="newGame" class="button">New Game</div>
</div>
`;