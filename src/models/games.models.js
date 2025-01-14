import { DataTypes } from "sequelize";

//K-factor for rating 1200 => 100, 1400 => 50, 1600 => 25, 1800 => 10 1900 => 7 1950 => 3


export default (sequelize) => {
  const Game = sequelize.define(
    "Game",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      player1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "players",
          key: "id",
        },
      },
      player2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "players",
          key: "id",
        },
      },
      winnerId: {
        type: DataTypes.INTEGER,
        references: {
          model: "players",
          key: "id",
        },
      },
      losserId: {
        type: DataTypes.INTEGER,
        references: {
          model: "players",
          key: "id",
        },
      },
      draw: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      history: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      player1Color: {
        type: DataTypes.STRING,
      },
      player2Color: {
        type: DataTypes.STRING,
      },
      player1RatingBefore: {
        type: DataTypes.INTEGER,
        defaultValue: 1200,
      },
      player2RatingBefore: {
        type: DataTypes.INTEGER,
        defaultValue: 1200,
      },
      player1RatingAfter: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      player2RatingAfter: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      gameStatus: {
        type: DataTypes.STRING,
        defaultValue: "on-going", //finished
      },
      //player1Id , player2Id, winnerId
    },
    {
      tableName: "games",
    }
  );
  return Game;
};
