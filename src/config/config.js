import dotenv from "dotenv";
dotenv.config();

const database_url = process.env.RENDER_DATABASE_URL;

// const url = new URL(database_url);

// console.log("url: ", url);

// console.log('database : ' , url.pathname.split("/")[1]);
// console.log('username : ' , url.username);


// const config = {
//   username: url.username,
//   password: url.password,
//   host: url.host,
//   port: url.port || 5432,
//   database: url.pathname.split("/")[1],
//   dialect: "postgres",
// };

const config = {
  username : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  host : process.env.DB_HOST,
  port : process.env.DB_PORT,
  database : process.env.DB_NAME,
  dialect : "postgres"
}

export default config;
