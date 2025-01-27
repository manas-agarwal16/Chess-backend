import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import {SocketHandler} from "./controllers/sockets.controller.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN.split(",") || "*";

app.use(
  cors({
    origin: function (origin, callback) {
      // console.log("origin", origin);
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

//http server for handling http request.
const server = http.createServer(app);

const io = SocketHandler(server);

import playerRouter from "./routes/player.routes.js";
app.use("/players", playerRouter);

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});


export { app , server , io };
