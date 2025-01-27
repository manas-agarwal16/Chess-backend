import { DataTypes } from "sequelize";

export default (sequelize) => {
  const OTPModel = sequelize.define(
    "OTPModel",
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      OTP: {
        type: DataTypes.STRING,
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
        defaultValue:
          "https://cdn.pixabay.com/photo/2016/03/31/19/56/avatar-1295397_1280.png",
      },
      expiresAt: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(new Date().getTime() + 15 * 60 * 1000), //15 mins after cur time.
      },
    },
    {
      tableName: "otps",
    }
  );
  return OTPModel;
};
