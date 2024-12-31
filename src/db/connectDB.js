import {sequelize , syncDB} from '../models/index.js';

const connectDB = async () => {
    try {
        await sequelize.authenticate();        
        console.log('Connection to DB has been established successfully.');
        await syncDB();
    } catch (error) {
        console.log('Unable to connect to the database:', error);
    }
}

export {connectDB};