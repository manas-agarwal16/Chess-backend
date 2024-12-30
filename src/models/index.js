import { Sequelize } from "sequelize";
import Config from "../config/config";

import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  Config.database,
  Config.username,
  Config.password,
  {
    host: Config.host,
    dialect: Config.dialect,
    // logging: false, if want no sql query on console.
  }
);

import PlayerModel from "./players.models";
import RatingModel from "./rating.models";
import WaitingsModels from "./waitings.models";
import GameModel from "./game.models";
import AudioModel from "./audio.models";

//Initializing Sequelize Models
const Player = PlayerModel(sequelize);
const Game = GameModel(sequelize);
const Waiting = WaitingsModels(sequelize);
const Rating = RatingModel(sequelize);
const Audio = AudioModel(sequelize);

//Associations

//player Game one to many
Player.hasMany(Game, { foreignKey: "player1Id", as: "GameAsPlayer1" });
Player.hasMany(Game,{foreignKey: "player2Id", as: "GamesAsPlayer2"});
Player.hasMany(Game, {foreignKey: "winnerId" , as: "GamesWon"});
Game.belongsTo(Player, {foreignKey: "player1Id", as: "Player1"});
Game.belongsTo(Player , {foreignKey: "player2Id", as: "Player2"});
Game.belongsTo(Player, {foreignKey: "winnderId", as: "Winner"});

//player to waiting: one to one
Player.hasOne(Waiting, {foreignKey: "waitingPlayerId" , as: "WaitingRecord"});
Waiting.belongsTo(Player, {foreignKey: "waitingPlayerId", as : "WaitingPlayer"});

//player to rating one to one
Player.hasOne(Rating, {foreignKey: "playerId" , as: "PlayerRating"});
Rating.belongsTo(Player , {foreignKey: "playerId" , as: "PlayerRecord"});
