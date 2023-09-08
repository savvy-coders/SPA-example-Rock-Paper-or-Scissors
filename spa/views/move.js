import html from "html-literal";
import '../assets/css/views/move.css';
import * as images from "../assets/img";
import { capitalize } from "lodash";

export default (state, gameData) => {
  return html`
    <div class="message flex-center">${gameData.message}</div>
    <div class="choices flex-center" contentEditable="false">
      ${Object.keys(gameData.hands).map(hand => {
        return `<div class="hand button" data-hand="${hand}"><img src="${images[hand]}" alt="${capitalize(hand)}"></div>`;
      }).join("")}
    </div>
  `;
}
