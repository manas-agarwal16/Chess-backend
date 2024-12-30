import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Rating = sequelize.define("Rating", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        rating:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1200,
        },
        playerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Players',
                key: 'id',
            }
        }
    });
    return Rating;
}