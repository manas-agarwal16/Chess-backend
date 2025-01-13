import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Waiting = sequelize.define(
    "Waiting",
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      playerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "players",
          key: "id",
        },
      },
      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "waitings",
    }
  );
  return Waiting;
};
