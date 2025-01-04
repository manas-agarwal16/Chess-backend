import { DataTypes } from "sequelize";

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
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        DefaultValue:
          "https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397_1280.png",
      },
      refreshToken: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "players",
    }
  );
  return Player;
};

// or
// export default (sequelize) => {
//   class User extends Model {}
//   User.init({});
// };
