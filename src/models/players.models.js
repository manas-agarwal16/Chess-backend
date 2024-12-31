import { DataTypes, Model } from "sequelize";

export default (sequelize) => {
  const Player = sequelize.define("Player", {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    handle: { //player handle
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
  },{
    tableName: "players",
  });
  return Player;
};

// or  
// export default (sequelize) => {
//   class User extends Model {}
//   User.init({});
// };
