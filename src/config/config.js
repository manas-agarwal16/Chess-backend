import dotenv from "dotenv";
dotenv.config();

const database_url = process.env.RENDER_DATABASE_URL;


const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  dialect: "postgres",
};

export default config;
