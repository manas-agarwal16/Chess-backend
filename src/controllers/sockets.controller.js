import { Server } from "socket.io";
import { Waiting, Player, GameState } from "../models/index.js";
import { Chess } from "chess.js";
import { Op, where } from "sequelize";

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
    //play with stranger
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

        // await GameState.create({
        //   roomName: roomName,
        //   player1Id: player1.id,
        //   player2Id: player2.id,
        //   board: game.fen(),
        // });

        console.log("game started");

        io.to(roomName).emit("startTheGame", { player1, player2, roomName });
      } else {
        const roomName = `room#${socket.id}`;
        socket.join(roomName);
        await Waiting.create({
          playerId,
          roomName: roomName,
        });
        console.log("waiting for a player");

        socket.emit("WaitingForAPlayer", roomName);
      }
    });

    //user disconnected
    socket.on("userDisconnected", async (playerId) => {
      console.log("userDisconnected : ", playerId);

      await Waiting.destroy({
        where: {
          playerId: playerId,
        },
      });
    });

    //new chess position
    socket.on("newChessPosition", async (data) => {
      console.log("newChessPosition : ", data);

      let exists = await GameState.findOne({
        where: {
          roomName: data.roomName,
        },
      });

      if (!exists) {
        exists = await GameState.create({
          roomName: data.roomName,
          player1Id: data.player1Id,
          player2Id: data.player2Id,
          chessBoardState: [
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          ],
          player1Color: data.player1Color,
          player2Color: data.player2Color,
        });
      }

      exists = exists?.dataValues;

      console.log("exists : ", exists);

      let updatedBoard = await GameState.update(
        {
          chessBoardState: [...exists.chessBoardState, data.position],
        },
        {
          where: {
            roomName: data.roomName,
          },
        }
      );

      updatedBoard = updatedBoard?.dataValues;
      console.log("updatedBoard : ", updatedBoard);

      io.to(data.roomName).emit("makeMove", data.position);
    });

    socket.on("checkmate", async (data) => {
      await GameState.update(
        {
          winnerId: data.winnerId,
          losserId: data.losserId,
        },
        {
          where: {
            roomName: data.roomName,
          },
        }
      );
      socket.emit("itsCheckmate");
    });

    socket.on("draw", async (data) => {
      await GameState.update(
        {
          itsDraw: true,
        },
        {
          where: {
            roomName: data.roomName,
          },
        }
      );
      socket.emit("itsDraw");
    });
  });

  return io;
};
