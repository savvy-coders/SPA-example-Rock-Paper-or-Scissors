import * as views from "../views";

export default (state, gameData) => `
<div id="main">${views[state.view](state, gameData)}</div>`;
