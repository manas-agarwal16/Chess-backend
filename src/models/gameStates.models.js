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
      chessBoardState: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      player1Color: {
        type: DataTypes.STRING,
      },
      player2Color: {
        type: DataTypes.STRING,
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
      itsDraw: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "gameStates",
    }
  );
  return gameState;
};
