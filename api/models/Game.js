import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  id: {
    type: String
  },
  complete: {
    type: Boolean,
    default: false
  },
  players: {
    type: Object
  },
  isAgainstComputer: {
    type: Boolean,
    default: true
  },
  message: {
    type: String
  }
});

const Game = mongoose.model("Game", gameSchema);

export default Game;