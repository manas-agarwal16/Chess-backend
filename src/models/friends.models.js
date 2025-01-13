import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Friend = sequelize.define(
    "Friend",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "players",
          key: "id",
        },
        unique: true,
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "friends",
    }
  );
  return Friend;
};
