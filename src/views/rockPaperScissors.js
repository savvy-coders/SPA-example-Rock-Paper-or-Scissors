import html from "html-literal";
import '../../assets/css/views/rockPaperScissors.css';
import * as images from "../../assets/img";

export default (state) => html`
<h1>Rock, Paper or Scissors</h1>
<div class="game" style="display: ${state.show ? 'flex' : 'none'}">
  <div id="player1" class="hand">
    <h2>Player 1</h2>
    <img src="${images[state.player1]}" alt="player 1 hand">
  </div>
  <div id="player2" class="hand">
    <h2>Player 2</h2>
    <img src="${images[state.player2]}" alt="player 2 hand">
  </div>
</div>

<h2>Make your selection:</h2>
<p>You may either click the buttons below or type 'r', 'p' or 's'</p>
<div class="choices" contentEditable="false">
  <div class="hand"><img src="${images.rock}" alt="" data-hand="rock"></div>
  <div class="hand"><img src="${images.paper}" alt="" data-hand="paper"></div>
  <div class="hand"><img src="${images.scissors}" alt="" data-hand="scissors"></div>
</div>
`;
