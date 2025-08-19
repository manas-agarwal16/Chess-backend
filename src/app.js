import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import passport from "./config/passport.js";
import googleAuthRoutes from "./routes/googleAuth.routes.js";
import { SocketHandler } from "./controllers/sockets.controller.js";

const app = express();

const allowedOrigins = ["https://chessmaster-manas.vercel.app", 'http://localhost:5173'];

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
app.use(passport.initialize());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

//http server for handling http request.
const server = http.createServer(app);

const io = SocketHandler(server);

import playerRouter from "./routes/player.routes.js";
app.use("/players", playerRouter);
app.use("/auth", googleAuthRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

export { app, server, io };
