import { DataTypes } from "sequelize";
import { formattedDate } from "../utils/formattedDate.js";

export default (sequelize) => {
  const Player = sequelize.define(
    "Player",
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      handle: {
        //player handle
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // for OAuth users
      },
      avatar: {
        type: DataTypes.STRING,
        DefaultValue:
          "https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397_1280.png",
      },
      refreshToken: {
        type: DataTypes.STRING,
      },
      rating: {
        type: DataTypes.INTEGER,
        DefaultValue: 1200,
      },
      ratingHistory: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        DefaultValue: [
          {
            rating: 1200,
            date: formattedDate(),
          },
        ],
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
    },
    {
      tableName: "players",
    }
  );
  return Player;
};
