import html from "html-literal";
import '../assets/css/views/join.css';

export default (state) => {
  return html`
    <h2>Join game</h2>

    <!--<h2>Make your selection:</h2>-->
    <form class="userForm">
      <label for="name">Name:</label>
      <input type="email" name="name" id="name" value="${state.name}" required placeholder="Enter Email Address">

      <input type="submit" class="button" id="joinGame" value="Join Game" />
    </form>
  `;
}
