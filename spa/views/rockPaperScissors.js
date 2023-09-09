import html from "html-literal";
import '../assets/css/views/rockPaperScissors.css';

export default (state, gameData) => {
  return html`<form class="userForm">
    <div class="flex-center mb-2">
      <label for="name" id="name-label">Name:</label>
      <input type="email" name="name" id="name" value="${state.name}" placeholder="Enter Email Address" required>
    </div>
    <div class="flex-center">
      <input type="submit" class="button" name="computerGame" id="computerGame" value="Start against Computer" />
      <input type="submit" class="button" name="opponentGame" id="opponentGame" value="Start against Player" />
    </div>
  </form>`;
}
