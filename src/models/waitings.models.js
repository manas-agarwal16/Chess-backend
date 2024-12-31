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
      waitingPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "players",
          key: "id",
        },
      },
      // joinedPlayerId: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "Players",
      //     key: "id",
      //   },
      // },
    },
    {
      tableName: "waitings",
    }
  );
  return Waiting;
};
