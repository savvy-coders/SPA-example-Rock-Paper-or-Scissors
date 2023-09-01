import html from "html-literal";
import '../assets/css/views/move.css';
import * as images from "../assets/img";

export default (state) => {
  console.log('matsinet-state', state);
  return html`
    <h2>Make your selection:</h2>
    <div class="choices" contentEditable="false">
      <div class="hand button" data-hand="rock"><img src="${images.rock}" alt="Rock"></div>
      <div class="hand button" data-hand="paper"><img src="${images.paper}" alt="Paper"></div>
      <div class="hand button" data-hand="scissors"><img src="${images.scissors}" alt="Scissors"></div>
    </div>
  `;
}
