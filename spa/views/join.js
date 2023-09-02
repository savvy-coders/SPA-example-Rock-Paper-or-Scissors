import html from "html-literal";
import '../assets/css/views/join.css';

export default (state) => {
  console.log('matsinet-state', state);
  return html`
    <h2>Join game</h2>

    <!--<h2>Make your selection:</h2>-->
    <div class="userForm">
      <label for="name">Name:</label>
      <input type="text" name="name" id="name" value="${state.name || 'Player 1'}">

      <div class="button" id="joinGame">Join game</div>
    </div>
  `;
}
