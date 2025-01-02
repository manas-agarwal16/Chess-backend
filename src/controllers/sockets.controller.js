import { Server } from "socket.io";
import { Waiting, Player } from "../models/index.js";
import { where } from "sequelize";

export const SocketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5174",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("playWithStranger", async (playerId) => {
      let waitingPlayer = await Waiting.findOne({
        order: [["createdAt", "ASC"]],
      });

      waitingPlayer = waitingPlayer?.dataValues;
      console.log("waitingPlayer : ", waitingPlayer);

      if (waitingPlayer) {
        await Waiting.destroy({
          where: {
            id: waitingPlayer.id,
          },
        });

        const roomName = waitingPlayer?.roomName;

        //here how to join the current player and the waitingPlayer in the same room.
        socket.join(roomName);

        const player1 = await Player.findOne({
          where: {
            id: playerId,
          },
        });

        const player2 = await Player.findOne({
          where: {
            id: waitingPlayer.playerId,
          },
        });

        io.to(roomName).emit("startTheGame", { player1, player2 });
      } else {
        const roomName = `room#${socket.id}`;
        socket.join(roomName);
        await Waiting.create({
          playerId,
          roomName: roomName,
        });
        socket.emit("WaitingForAPlayer");
      }
    });
  });

  return io;
};
