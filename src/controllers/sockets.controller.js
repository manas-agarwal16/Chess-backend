import { Server } from "socket.io";
import { Waiting, Player, GameState } from "../models/index.js";
import { Chess } from "chess.js";
import { Op } from "sequelize";

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
    socket.on("playWithStranger", async (playerId) => {
      console.log("playerId socketId : ", playerId, socket.id);
      if (!playerId) {
        return socket.emit("error", "Player not found!!! invalid player id");
      } 

      let waitingPlayer = await Waiting.findOne({
        order: [["createdAt", "ASC"]], 
        where: {
          [Op.not]: {
            playerId: playerId,
          },
        },
        // logging: console.log,
      });

      // console.log("waitingPlayer : ", waitingPlayer);
      waitingPlayer = waitingPlayer?.dataValues;

      if (waitingPlayer) {
        const roomName = waitingPlayer?.roomName;
        // console.log("roomName : ", roomName);

        await Waiting.destroy({
          where: {
            playerId: waitingPlayer.playerId,
          },
        });

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

        if (!player1 || !player2) {
          return socket.emit("error", "Player not found!!! invalid player id");
        }

        player1 = player1?.dataValues;
        player2 = player2?.dataValues;

        // console.log("player1 : ", player1);
        // console.log("player2 : ", player2);
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

    socket.on("userDisconnected", async (playerId) => {
      console.log("userDisconnected : ", playerId);
      
      await Waiting.destroy({
        where: {
          playerId: playerId,
        },
      });
    });

    //state of board
    socket.on("StateOfBoard", () => {
      socket.emit("StateOfBoard", game.fen());
    });
  });

  return io;
};
