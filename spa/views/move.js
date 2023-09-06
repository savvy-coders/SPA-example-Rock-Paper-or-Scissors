import html from "html-literal";
import '../assets/css/views/move.css';
import * as images from "../assets/img";
import { capitalize } from "lodash";

export default (state, gameData) => {
  console.log('matsinet-state', state);
  console.log('matsinet-gameData', gameData);
  return html`
    <div class="message">${gameData.message}</div>
    <h2>Make your selection:</h2>
    <div class="choices" contentEditable="false">
      ${Object.keys(gameData.hands).map(hand => {
        return `<div class="hand button" data-hand="${hand}"><img src="${images[hand]}" alt="${capitalize(hand)}"></div>`;
      }).join("")};
    </div>
  `;
}
