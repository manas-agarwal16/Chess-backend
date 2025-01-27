import { Op, where } from "sequelize";
import { Game, OTP, Player, sequelize } from "../models/index.js";
import { generateOTP, sendOTPThroughEmail } from "../utils/otp_generator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { encrptPassword } from "../utils/encryptPassword.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import bcrypt from "bcrypt";
import { formattedDate } from "../utils/formattedDate.js";
import jwt from "jsonwebtoken";

//clear
const register = asyncHandler(async (req, res) => {
  let { handle, email, password, avatarURL } = req.body;
  console.log("register avatarURL", avatarURL);
  if (!handle || !email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Please provide all the required fields"));
  }
  handle = handle.toLowerCase();
  email = email.toLowerCase();
  // console.log(req.body);
  // console.log("avatarURL", avatarURL);

  let exists = await Player.findOne({
    where: {
      [Op.or]: [{ email }, { handle }],
    },
  });
  console.log("exists: ", exists);

  exists = exists?.dataValues;

  // console.log("exists", exists);

  if (exists) {
    return res
      .status(409)
      .json(new ApiResponse(409, "", "Email or handle already exists"));
  }

  exists = await OTP.findOne({
    where: {
      [Op.or]: [{ email }, { handle }],
    },
  });

  if (exists) {
    return res
      .status(409)
      .json(new ApiResponse(409, "", "Email or handle already exists"));
  }

  const otp = generateOTP();

  const otpPlayer = await OTP.create({
    OTP: otp,
    handle: handle.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatarURL,
  });
  // console.log("otpPlayer", otpPlayer);

  await sendOTPThroughEmail(email, otp)
    .then(() => {
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "",
            `An OTP has been sent to ${email} for verification`
          )
        );
    })
    .catch((error) => {
      console.error("Error sending OTP through email:", error);
      return res
        .status(501)
        .json(new ApiResponse(501, "", "Error sending OTP. Please try again!"));
    });
});

//clear
const verifyOTP = asyncHandler(async (req, res) => {
  let { email, otp } = req.body;
  console.log("otp type", typeof otp);

  email = email.toLowerCase();
  console.log("verifyOTP email", email, "otp", otp);

  const alreadyExists = await Player.findOne({
    where: {
      email: {
        [Op.iLike]: email,
      },
    },
  });

  if (alreadyExists) {
    return res
      .status(409)
      .json(
        new ApiResponse(409, "", "You have already registered. Please login")
      );
  }

  // console.log("email", email);
  // console.log("otp", otp);

  if (!email || !otp) {
    return res
      .status(409)
      .json(new ApiResponse(409, "", "Please provide email and otp"));
  }

  // otp = Number(otp);

  let otpDb = await OTP.findOne({
    where: {
      email: {
        [Op.iLike]: email,
      },
    },
  });
  console.log("otpDb", otpDb);
  otpDb = otpDb?.dataValues;

  if (!otpDb) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          "",
          "Email not found or OTP has expired. Please register again"
        )
      );
  }

  console.log("database OTP", otpDb.OTP);

  if (otpDb.OTP != otp) {
    return res.status(401).json(new ApiResponse(401, "", "Invalid OTP!!!"));
  }

  const encrptedPassword = await encrptPassword(otpDb.password);
  // console.log("encrptedPassword", encrptedPassword);

  const player = await Player.create({
    handle: otpDb.handle,
    email: otpDb.email,
    password: encrptedPassword,
    avatar: otpDb.avatar,
    rating: 1200,
    ratingHistory: [{ rating: 1200, date: formattedDate() }],
  });

  // console.log("player", player);

  await OTP.destroy({
    where: {
      email: {
        [Op.iLike]: email,
      },
    },
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { handle: otpDb.handle, email: otpDb.email, password: otpDb.password },
        "You are registered successfully"
      )
    );
});

//clear
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.params;
  console.log("email : ", email);

  const player = await OTP.findOne({
    where: { email: { [Op.iLike]: email } },
  });

  console.log("resend otp");

  if (!player) {
    console.log("Email not found");

    return res
      .status(404)
      .json(new ApiResponse(404, "", "Email not found. Try registering again"));
  }

  const otp = generateOTP();

  const updateOTP = await OTP.update(
    { OTP: otp },
    { where: { email: { [Op.iLike]: email } } }
  );
  // console.log("updateOTP", updateOTP);

  if (!updateOTP) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          "",
          "Email not found or expired. Try Registering again"
        )
      );
  }

  await sendOTPThroughEmail(email, otp)
    .then(() => {
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "",
            `Thank you for registering on Chess. An OTP has been sent to your email for verification.`
          )
        );
    })
    .catch((err) => {
      return res
        .status(401)
        .json(new ApiResponse(401, "", "Error in sending email"));
    });
});

//clear
const login = asyncHandler(async (req, res) => {
  let { emailOrHandle, password } = req.body;

  emailOrHandle = emailOrHandle.toLowerCase();

  if (!emailOrHandle || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Please provide all the required fields"));
  }

  let player = await Player.findOne({
    where: {
      [Op.or]: [{ email: emailOrHandle }, { handle: emailOrHandle }],
    },
  });

  if (!player) {
    return res.status(404).json(new ApiResponse(404, "", "Player not found"));
  }

  //comaparing password
  const isMatch = await bcrypt.compare(password, player.password);
  if (!isMatch) {
    return res.status(401).json(new ApiResponse(401, "", "Invalid Password"));
  }

  player.password = undefined;

  const accessToken = await generateAccessToken(player);
  const refreshToken = await generateRefreshToken(player);

  // console.log("accessToken", accessToken);

  await Player.update({ refreshToken }, { where: { id: player.id } });

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      sameSite: "None",
      httpOnly: true,
      secure: true,
      maxAge: 60 * 24 * 60 * 1000, //1d
    })
    .cookie("refreshToken", refreshToken, {
      sameSite: "None",
      httpOnly: true,
      secure: true,
      maxAge: 60 * 24 * 60 * 1000 * 60,
    })
    .json(
      new ApiResponse(
        201,
        { loginStatus: true, playerData: player },
        "Logged in successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // console.log('in refreshAccessToken');

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(401, "", "refresh token expired"));
  }

  let decodedIncomingRefreshToken;
  try {
    decodedIncomingRefreshToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_KEY
    );
  } catch (error) {
    // console.log("refresh token expired : ", error);
    return res
      .status(401)
      .json(new ApiResponse(401, "", "refresh token has expired!!!"));
  }

  if (!decodedIncomingRefreshToken) {
    return res
      .status(501)
      .json(new ApiResponse(501, "", "Error in decoding refresh token"));
  }

  console.log("decodedIncomingRefreshToken : ", decodedIncomingRefreshToken);

  if (!decodedIncomingRefreshToken.id) {
    return res
      .status(401)
      .json(new ApiResponse(401, "", "Invalid refreshToken"));
  }

  let player = await Player.findOne({
    where: {
      id: decodedIncomingRefreshToken.id,
    },
  });

  player = player?.dataValues;

  if (!player) {
    return res
      .status(401)
      .json(new ApiResponse(401, "", "Invalid refreshToken"));
  }

  const dbRefreshToken = player.refreshToken;

  if (!dbRefreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(401, "", "player has logged out already!!!"));
  }

  if (dbRefreshToken !== incomingRefreshToken) {
    return res
      .status(401)
      .json(new ApiResponse(401, "", "Invalid refreshToken"));
  }

  const newAccessToken = await generateAccessToken(player);
  if (!newAccessToken) {
    return res
      .status(501)
      .json(new ApiResponse(501, "", "Error in generating accessToken"));
  }

  return res
    .status(201)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 24 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        201,
        {
          accessToken: newAccessToken,
          handle: player.handle,
        },
        "AccessToken is refreshed successfully!!!"
      )
    );
});

//clear
const getCurrentPlayer = asyncHandler(async (req, res) => {
  let player;
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log("token : ", token);

    if (!token) {
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            { loginStatus: false, playerData: {} },
            "Unauthorized request!!"
          )
        );
    }

    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    // console.log("decodedToken : ", decodedToken);

    if (!decodedToken) {
      return res
        .status(501)
        .json(new ApiResponse(501, "", "error in decoding token"));
    }

    player = await Player.findOne({
      attributes: { exclude: ["password", "refreshToken"] },
      where: {
        email: decodedToken.email,
      },
    });

    player = player?.dataValues;

    // console.log("player : ", player);

    if (!player) {
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            { loginStatus: false, playerData: {} },
            "Unauthorized request!!"
          )
        );
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { loginStatus: true, playerData: player },
          "Current player details fetched successfully"
        )
      );
  } catch (error) {
    console.log("error : ", error);

    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          { loginStatus: false, playerData: {} },
          "invalid access token"
        )
      );
  }
});

//clear
const logout = asyncHandler(async (req, res) => {
  // console.log("logout");
  const { id } = req.player;

  const updateRefreshToken = await Player.update(
    {
      refreshToken: undefined,
    },
    {
      where: {
        id: id,
      },
    }
  );
  // console.log("updateRefreshToken", updateRefreshToken);

  if (!updateRefreshToken) {
    return res
      .status(501)
      .json(new ApiResponse(501, "", "Error in updating refresh token"));
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        201,
        { handle: req.player.handle },
        `${req.player.handle} has logged out successfully`
      )
    );
});

const fetchPlayerRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // console.log("id", id);
  if (!id) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Please provide player id"));
  }
  try {
    let data = await Player.findOne({
      attributes: ["rating"],
      where: {
        id: id,
      },
    });
    // console.log("data", data);
    data = data?.dataValues?.rating;

    return res.status(200).json(new ApiResponse(200, data, "Player rating"));
  } catch (error) {
    console.error("Error in fetching player rating", error);
    return res.status(501).json(new ApiResponse(501, "", "Error in fetching"));
  }
});

const playerProfile = asyncHandler(async (req, res) => {
  // console.log("in playerProfile");
  const { handle } = req.params;
  const { page } = req.query;
  // console.log("page", page);

  console.log("handle", handle);
  try {
    let playerData = await Player.findOne({
      attributes: { exclude: ["password", "refreshToken", "updatedAt"] },
      where: {
        handle: {
          [Op.iLike]: handle,
        },
      },
    });
    if (!playerData) {
      return res.status(404).json(new ApiResponse(404, "", "Player not found"));
    }
    playerData = playerData?.dataValues;

    let totalMatches, wins, losses, draws;
    if (page == 1) {
      totalMatches = await Game.count({
        where: {
          [Op.or]: [{ player1Id: playerData.id }, { player2Id: playerData.id }],
        },
      });
      console.log("totalMatches", totalMatches);
      wins = await Game.count({
        where: {
          winnerId: playerData.id,
        },
      });

      losses = await Game.count({
        where: {
          losserId: playerData.id,
        },
      });

      draws = totalMatches - (wins + losses);
    }

    let matchesData = await Game.findAll({
      attributes: [
        "id",
        "roomName",
        "gameStatus",
        "player1Id",
        "player2Id",
        "player1RatingBefore",
        "player2RatingBefore",
        "player1RatingAfter",
        "player2RatingAfter",
        "player1Color",
        "player2Color",
        [
          sequelize.literal(`
            CASE
              WHEN "Game"."winnerId" = ${playerData.id} THEN 'Won'
              WHEN "Game"."losserId" = ${playerData.id} THEN 'Lost'
              WHEN "Game"."gameStatus" = 'on-going' THEN 'Pending'
              ELSE 'Draw'
            END
          `),
          "Result",
        ],
      ],
      where: {
        [Op.or]: [{ player1Id: playerData.id }, { player2Id: playerData.id }],
      },
      order: [["id", "DESC"]],
      offset: (page - 1) * 5,
      limit: 5,
    });

    matchesData = matchesData.map((match) => match.dataValues);

    // console.log("matchesData: ", matchesData);
    let matches = await Promise.all(
      matchesData.map(async (match) => {
        let opponentHandle = await Player.findOne({
          attributes: ["handle"],
          where: {
            id:
              playerData.id === match.player1Id
                ? match.player2Id
                : match.player1Id,
          },
        });
        opponentHandle = opponentHandle?.dataValues?.handle;
        let data = {};
        data.opponentHandle = opponentHandle;
        data.opponentRatingBefore =
          playerData.id === match.player1Id
            ? match.player2RatingBefore
            : match.player1RatingBefore;
        data.opponentRatingAfter =
          playerData.id === match.player1Id
            ? match.player2RatingAfter ?? "PENDING"
            : match.player1RatingAfter ?? "PENDING";
        data.opponentColor =
          playerData.id === match.player1Id
            ? match.player2Color
            : match.player1Color;
        data.result = match.Result;
        data.status = match.gameStatus;
        data.id = match.id;
        data.roomName = match.roomName;
        data.playerColor =
          playerData.id === match.player1Id
            ? match.player1Color
            : match.player2Color;
        data.playerRatingBefore =
          playerData.id === match.player1Id
            ? match.player1RatingBefore
            : match.player2RatingBefore;
        data.playerRatingAfter =
          playerData.id === match.player1Id
            ? match.player1RatingAfter ?? "pending"
            : match.player2RatingAfter ?? "pending";
        return data;
      })
    );

    if (page == 1) {
      return res.status(201).json(
        new ApiResponse(
          201,
          {
            id: playerData.id,
            rating: playerData.rating,
            totalMatches,
            wins,
            losses,
            draws,
            email: playerData.email,
            handle: playerData.handle,
            avatar: playerData.avatar,
            ratingHistory: playerData.ratingHistory,
            matches: matches,
            registered: playerData.createdAt,
          },
          "Player profile"
        )
      );
    }
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          id: playerData.id,
          rating: playerData.rating,
          email: playerData.email,
          handle: playerData.handle,
          avatar: playerData.avatar,
          ratingHistory: playerData.ratingHistory,
          matches: matches,
          registered: playerData.createdAt,
        },
        "Player profile"
      )
    );
  } catch (error) {
    console.log("error in fetching player profile", error);

    return res
      .status(501)
      .json(new ApiResponse(501, "", "Error fetching player profile"));
  }
});

const viewMatch = asyncHandler(async (req, res) => {
  const { matchId, playerId } = req.params;
  console.log("matchId", matchId, "playerId", playerId);

  if (!matchId || !playerId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Please provide matchId and playerId"));
  }

  const match = await Game.findOne({
    attributes: [
      "history",
      [
        sequelize.literal(`
        CASE
          WHEN "Game"."winnerId" = ${playerId} THEN 'WON'
          WHEN "Game"."losserId" = ${playerId} THEN 'LOST'
          ELSE 'DRAW'
          END
      `),
        "result",
      ],
      [
        sequelize.literal(`
          CASE 
          WHEN "Game"."player1Id" = ${playerId} THEN "Game"."player1Color"
          ELSE "Game"."player2Color"
          END
          `),
        "color",
      ],
    ],
    where: {
      id: matchId,
      [Op.or]: [{ player1Id: playerId }, { player2Id: playerId }],
    },
  });

  console.log("match: ", match);

  if (!match) {
    return res.status(400).json(new ApiResponse(404, "", "Match not found"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, match, "Match fetched successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatarURL, id } = req.body;
  console.log("avatarURL", avatarURL);
  await Player.update({ avatar: avatarURL }, { where: { id } });
  return res
    .status(201)
    .json(new ApiResponse(201, "", "Avatar updated successfully"));
});

export {
  updateAvatar,
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshAccessToken,
  logout,
  getCurrentPlayer,
  fetchPlayerRating,
  playerProfile,
  viewMatch,
};
