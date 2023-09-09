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
  },
  timestamp: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toString();
    }
  }
});

const Game = mongoose.model("Game", gameSchema);

export default Game;