import html from "html-literal";
import '../assets/css/views/rockPaperScissors.css';
import * as images from "../assets/img";

export default (state, gameData) => {
  return html`
    <h2>Start game</h2>
    
    <!--<h2>Make your selection:</h2>-->
    <div class="userForm">
      <label for="name">Name:</label>
      <input type="text" name="name" id="name" value="${state.name || 'Player 1'}">
      
      <div class="button" id="computerGame">Start against Computer</div>
      <div class="button" id="opponentGame">Start against Player</div>
    </div>
  `;
}
