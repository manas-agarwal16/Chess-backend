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
      },
      socketId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "friends",
    }
  );
  return Friend;
};
