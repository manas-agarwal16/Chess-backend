import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Game = sequelize.define("Game", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        player1Id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'players',
                key: 'id',
            }
        },
        player2Id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'players',
                key: 'id',
            }
        },
        winnerId:{
            type: DataTypes.INTEGER,
            references:{
                model: 'players',
                key: 'id',
            }
        },
        player1RatingBefore: {
            type: DataTypes.INTEGER,
            defaultValue: 1200,
        },
        player2RatingBefore: {
            type: DataTypes.INTEGER,
            defaultValue: 1200,
        },
        player1RatingAfter: {
            type: DataTypes.INTEGER,
            defaultValue: 1200,
        },
        player2RatingAfter: {
            type: DataTypes.INTEGER,
            defaultValue: 1200,
        },
        gameStatus: {
            type: DataTypes.STRING,
            defaultValue: "on-going",
        },
        //player1Id , player2Id, winnerId
    },{
        tableName: 'games',
    });
    return Game;
}