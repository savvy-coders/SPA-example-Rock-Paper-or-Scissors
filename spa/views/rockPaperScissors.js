import html from "html-literal";
import '../assets/css/views/rockPaperScissors.css';

export default (state, gameData) => {
  return html`<div class="userForm">
    <div class="flex-center mb-2">
      <label for="name" id="name-label">Name:</label>
      <input type="text" name="name" id="name" value="${state.name}" placeholder="Enter Name" required>
    </div>
    <div class="flex-center">
      <div class="button" id="computerGame">Start against Computer</div>
      <div class="button" id="opponentGame">Start against Player</div>
    </div>
  </div>`;
}
