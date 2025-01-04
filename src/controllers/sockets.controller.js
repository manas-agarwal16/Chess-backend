import { Server } from "socket.io";
import { Waiting, Player, GameState } from "../models/index.js";
import { Chess } from "chess.js";

//game.fen() -> for current state of the chess board , return a string,

export const SocketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5174",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let game = new Chess();

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

        let player1 = await Player.findOne({
          where: {
            id: playerId,
          },
        });

        let player2 = await Player.findOne({
          where: {
            id: waitingPlayer.playerId,
          },
        });

        player1 = player1?.dataValues;
        player2 = player2?.dataValues;

        console.log("player1 : ", player1);
        console.log("player2 : ", player2);
        const color = Math.floor(Math.random() * 2) === 0 ? "white" : "black";
        player1.color = color;
        player2.color = color === "white" ? "black" : "white";

        //start the game

        await GameState.create({
          roomName: roomName,
          player1Id: player1.id,
          player2Id: player2.id,
          board: game.fen(),
        });

        io.to(roomName).emit("startTheGame", { player1, player2 });

        //state of board
        socket.on("StateOfBoard", () => {
          socket.emit("StateOfBoard", game.fen());
        });
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
