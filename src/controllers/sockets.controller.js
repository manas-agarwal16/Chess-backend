import { Server } from "socket.io";
import { Waiting, Player, Game, Friend } from "../models/index.js";
import { Chess } from "chess.js";
import { Op } from "sequelize";
import { uniqueCode } from "../utils/uniqueCode.js";
import { wFactor, lFactor } from "../utils/Factors.js";

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

        // await Game.create({
        //   roomName: roomName,
        //   player1Id: player1.id,
        //   player2Id: player2.id,
        //   board: game.fen(),
        // });

        console.log("game started");

        io.to(roomName).emit("startTheGame", {
          player1,
          player2,
          roomName,
          todoId: player1.id,
        });
      } else {
        const roomName = `room#${socket.id}`;
        socket.join(roomName);
        try {
          await Waiting.create({
            playerId,
            roomName: roomName,
          });
          console.log("already in waitings");
        } catch (error) {
          console.log("already in waitings");
        }

        console.log("waiting for a player");

        socket.emit("WaitingForAPlayer", roomName);
      }
    });

    //create room for friend
    socket.on("createRoom", async (playerId) => {
      if (!playerId) {
        socket.emit("error", "playerId is required");
        return;
      }
      const exists = await Friend.findOne({
        where: {
          playerId: playerId,
        },
      });
      if (exists) {
        await Friend.destroy({
          where: {
            playerId: playerId,
          },
        });
      }

      let waitingFriend = await Friend.create({
        playerId: playerId,
        socketId: socket.id,
        roomName: `room#${socket.id}`,
        code: uniqueCode(),
      });

      waitingFriend = waitingFriend?.dataValues;

      socket.join(`room#${socket.id}`);
      console.log("waitingFriend : ", waitingFriend);
      socket.emit("askToEnterCode", waitingFriend.code);
    });

    //join room
    socket.on("joinRoom", async ({ code, playerId }) => {
      if (!playerId) {
        socket.emit("error", "playerId is required");
        return;
      }
      code = Number(code);
      console.log("code : ", code);

      let waitingFriend = await Friend.findOne({
        where: {
          code: code,
        },
      });

      console.log("waitingFriend : ", waitingFriend);

      waitingFriend = waitingFriend?.dataValues;

      if (!waitingFriend) {
        return socket.emit("invalidCode", "Invalid code");
      }
      await Friend.destroy({
        where: {
          code: code,
        },
      });
      socket.join(waitingFriend.roomName);

      let player1 = await Player.findOne({
        where: {
          id: playerId,
        },
      });

      let player2 = await Player.findOne({
        where: {
          id: waitingFriend.playerId,
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

      io.to(waitingFriend.roomName).emit("startTheGame", {
        player1,
        player2,
        roomName: waitingFriend.roomName,
        todoId: player1.id,
      });
    });

    socket.on("updateTodoId", ({ id, roomName }) => {
      console.log("updateTodoId : ", id);
      io.to(roomName).emit("updateTodoIdFromBackend", id);
    });

    //playersInfo when the match starts roomName player1 are candidate keys. player1 is you.
    socket.on(
      "playersInfo",
      async ({
        roomName,
        player1Id,
        player2Id,
        player1RatingBefore,
        player2RatingBefore,
        player1Color,
        player2Color,
      }) => {
        console.log(
          "playersInfo : ",
          roomName,
          player1Id,
          player2Id,
          player1RatingBefore,
          player2RatingBefore,
          player1Color,
          player2Color
        );

        let exists = await Game.findOne({
          where: {
            roomName: roomName,
          },
        });
        try {
          if (!exists) {
            let newGame = await Game.create({
              roomName,
              player1Id,
              player2Id,
              player1Color,
              player2Color,
              player1RatingBefore,
              player2RatingBefore,
              history: [
                "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
              ],
            });
            // console.log("newGame: ", newGame?.dataValues);
          } else {
            console.log("only unique roomName is allowed");
          }
        } catch (error) {
          console.log("only unique roomName is allowed");
        }
      }
    );

    //new chess position
    socket.on("newChessPosition", async (data) => {
      // console.log("newChessPosition : ", data);

      // let exists = await Game.findOne({
      //   where: {
      //     roomName: data.roomName,
      //   },
      // });

      // if (!exists) {
      // let exists = await Game.create({
      //   roomName: data.roomName,
      //   player1Id: data.player1Id,
      //   player2Id: data.player2Id,
      //   history: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
      //   player1Color: data.player1Color,
      //   player2Color: data.player2Color,
      // });
      // }

      // exists = exists?.dataValues;

      // console.log("exists : ", exists);

      let pastHistory = await Game.findOne({
        where: {
          roomName: data.roomName,
        },
      });

      if (!pastHistory) {
        return;
      }

      // console.log("pastHistory : ", pastHistory);
      pastHistory = pastHistory?.dataValues?.history;

      let updatedBoard = await Game.update(
        {
          history: [...pastHistory, data.position],
        },
        {
          where: {
            roomName: data.roomName,
          },
          returning: true,
        }
      );

      // console.log("updatedBoard : ", updatedBoard);

      io.to(data.roomName).emit("makeMove", data.position);
    });

    //checkmate and rating calculations. if won raiting + wFactor * (opp / you) if loose raiting - lFactor * (you / opp);
    socket.on("checkmate", async ({ roomName, winnerId, losserId }) => {
      console.log("checkmate : ", roomName, winnerId, losserId);

      let playedGame = await Game.findOne({
        where: {
          roomName: roomName,
        },
      });

      if (!playedGame) {
        socket.emit("error", "playedGame null");
        return;
      }

      playedGame = playedGame?.dataValues;
      // console.log("playedGame : ", playedGame);

      const player1RatingBefore = playedGame.player1RatingBefore;
      const player2RatingBefore = playedGame.player2RatingBefore;

      let player1RatingAfter, player2RatingAfter;

      if (winnerId === playedGame.player1Id) {
        player1RatingAfter =
          player1RatingBefore +
          wFactor(player1RatingBefore) *
            (player2RatingBefore / player1RatingBefore);

        player2RatingAfter =
          player2RatingBefore -
          lFactor(player2RatingBefore) *
            (player2RatingBefore / player1RatingBefore);
      } else {
        player2RatingAfter =
          player2RatingBefore +
          wFactor(player2RatingBefore) *
            (player1RatingBefore / player2RatingBefore);

        player1RatingAfter =
          player1RatingBefore -
          lFactor(player1RatingBefore) *
            (player1RatingBefore / player2RatingBefore);
      }

      player1RatingAfter = Math.floor(player1RatingAfter);
      player2RatingAfter = Math.floor(player2RatingAfter);

      // console.log("player1RatingAfter: ", player1RatingAfter);
      // console.log("player2RatingAfter: ", player2RatingAfter);
      await Game.update(
        {
          winnerId: winnerId,
          losserId: losserId,
          gameStatus: "finished",
          player1RatingAfter: player1RatingAfter,
          player2RatingAfter: player2RatingAfter,
        },
        {
          where: {
            roomName: roomName,
          },
        }
      );
      await Player.update(
        {
          rating: player1RatingAfter,
        },
        {
          where: {
            id: playedGame.player1Id,
          },
        }
      );

      await Player.update(
        {
          rating: player2RatingAfter,
        },
        {
          where: {
            id: playedGame.player2Id,
          },
        }
      );
      io.to(roomName).emit("itsCheckmate", {
        player1RatingBefore,
        player1RatingAfter,
        player2RatingBefore,
        player2RatingAfter,
        player1Id: playedGame.player1Id,
        player2Id: playedGame.player2Id,
      });
    });

    //draw and rating calculations. for draw raiting + (opp - you) / 5;
    socket.on("draw", async ({ roomName }) => {
      let playedGame = await Game.findOne({
        where: {
          roomName: roomName,
        },
      });
      if (!playedGame) {
        socket.emit("error", "playedGame null");
        return;
      }

      playedGame = playedGame.dataValues;

      const player1RatingBefore = playedGame.player1RatingBefore;
      const player2RatingBefore = playedGame.player2RatingBefore;

      let player1RatingAfter, player2RatingAfter;

      player1RatingAfter =
        player1RatingBefore + (player2RatingBefore - player1RatingBefore) / 5;

      player2RatingAfter =
        player2RatingBefore + (player1RatingBefore - player2RatingBefore) / 5;

      player1RatingAfter = Math.ceil(player1RatingAfter);
      player2RatingAfter = Math.ceil(player2RatingAfter);

      console.log("player1RatingAfter: ", player1RatingAfter);
      console.log("player2RatingAfter: ", player2RatingAfter);
      await Game.update(
        {
          winnerId: winnerId,
          losserId: losserId,
          gameStatus: "finished",
          player1RatingAfter: player1RatingAfter,
          player2RatingAfter: player2RatingAfter,
        },
        {
          where: {
            roomName: roomName,
          },
        }
      );

      await Player.update(
        {
          rating: player1RatingAfter,
        },
        {
          where: {
            id: playedGame.player1Id,
          },
        }
      );

      await Player.update(
        {
          rating: player2RatingAfter,
        },
        {
          where: {
            id: playedGame.player2Id,
          },
        }
      );
      socket.emit("itsDraw", {
        player1RatingBefore,
        player1RatingAfter,
        player2RatingBefore,
        player2RatingAfter,
        player1Id: playedGame.player1Id,
        player2Id: playedGame.player2Id,
      });
    });

    socket.on("resignGame", async ({ roomName, playerId }) => {
      console.log("resign Game");
      console.log("playerId : ", playerId);

      io.to(roomName).emit("resignedGame", { roomName, playerId });
    });

    //user disconnected
    socket.on("userDisconnected", async (playerId) => {
      console.log("userDisconnected : ", playerId);

      await Waiting.destroy({
        where: {
          playerId: playerId,
        },
      });
      await Friend.destroy({
        where: {
          playerId: playerId,
        },
      });
    });
  });

  return io;
};
