import html from "html-literal";
import '../assets/css/views/rockPaperScissors.css';
import * as images from "../assets/img";

export default (state) => html`
<h2>Make your selection:</h2>
<div class="userForm">
  <label for="name">Name:</label>
  <input type="text" name="name" id="name">
</div>
<!--<p>You may either click the buttons below or type 'r', 'p' or 's'</p>-->
<div class="choices" contentEditable="false">
  <div class="hand button" data-hand="rock"><img src="${images.rock}" alt="Rock"></div>
  <div class="hand button" data-hand="paper"><img src="${images.paper}" alt="Paper"></div>
  <div class="hand button" data-hand="scissors"><img src="${images.scissors}" alt="Scissors"></div>
</div>
`;
