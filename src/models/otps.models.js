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
        defaultValue:
          "https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=",
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
