import { DataTypes } from "sequelize";

export default (sequelize) => {
  const gameState = sequelize.define(
    "gameState",
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      player1Id: {
        type: DataTypes.INTEGER,
        references: {
          model: "players",
          key: "id",
        },
      },
      player2Id: {
        type: DataTypes.INTEGER,
        references: {
          model: "players",
          key: "id",
        },
      },
      board: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "gameStates",
    }
  );
  return gameState;
};
