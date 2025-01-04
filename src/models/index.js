import { Sequelize } from "sequelize";
import Config from "../config/config.js";

import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  Config.database,
  Config.username,
  Config.password,
  {
    host: Config.host,
    dialect: Config.dialect,
    logging: false, // false if want no sql query on console.
  }
);

import PlayerModel from "./players.models.js";
import RatingModel from "./ratings.models.js";
import WaitingsModels from "./waitings.models.js";
import GameModel from "./games.models.js";
import AudioModel from "./audios.models.js";
import OTPModel from "./otps.models.js";
import GameStateModel from "./gameStates.models.js";

//Initializing Sequelize Models
const Player = PlayerModel(sequelize);
const Game = GameModel(sequelize);
const Waiting = WaitingsModels(sequelize);
const Rating = RatingModel(sequelize);
const Audio = AudioModel(sequelize);
const OTP = OTPModel(sequelize);
const GameState = GameStateModel(sequelize);
//Associations

//player Game one to many
Player.hasMany(Game, { foreignKey: "player1Id", as: "GameAsPlayer1" });
Player.hasMany(Game, { foreignKey: "player2Id", as: "GamesAsPlayer2" });
Player.hasMany(Game, { foreignKey: "winnerId", as: "GamesWon" });
Game.belongsTo(Player, { foreignKey: "player1Id", as: "Player1" });
Game.belongsTo(Player, { foreignKey: "player2Id", as: "Player2" });
Game.belongsTo(Player, { foreignKey: "winnerId", as: "Winner" });

//player to waiting: one to one
Player.hasOne(Waiting, { foreignKey: "playerId", as: "WaitingPlayer" });
Waiting.belongsTo(Player, {
  foreignKey: "playerId",
  as: "WaitingPlayerDetails",
});

//player to rating one to one
Player.hasOne(Rating, { foreignKey: "playerId", as: "PlayerRating" });
Rating.belongsTo(Player, { foreignKey: "playerId", as: "PlayerDetails" });

//Player to Audio one to one
Player.hasOne(Audio, { foreignKey: "player1Id", as: "AudioAsPlayer1" });
Player.hasOne(Audio, { foreignKey: "player2Id", as: "AudioAsPlayer2" });
Audio.belongsTo(Player, { foreignKey: "player1Id", as: "Player1Details" });
Audio.belongsTo(Player, { foreignKey: "player2Id", as: "Player2Details" });

//Game to Audio one to one
Game.hasOne(Audio, { foreignKey: "gameId", as: "GameAudio" });
Audio.belongsTo(Game, { foreignKey: "gameId", as: "GameDetails" });

//players to GameState one to one
Player.hasOne(GameState, { foreignKey: "player1Id", as: "Player1GameState" });
Player.hasOne(GameState, { foreignKey: "player2Id", as: "Player2GameState" });
GameState.belongsTo(Player, { foreignKey: "player1Id", as: "Player1Details" });
GameState.belongsTo(Player, { foreignKey: "player2Id", as: "Player2Details" });

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.log("Error syncing models", error);
  }
};

export {
  sequelize,
  Player,
  Game,
  Waiting,
  Rating,
  Audio,
  OTP,
  GameState,
  syncDB,
};
