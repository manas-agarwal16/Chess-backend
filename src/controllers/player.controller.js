import { Op } from "sequelize";
import { OTP, Player } from "../models/index.js";
import { generateOTP, sendOTPThroughEmail } from "../utils/otp_generator.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { encrptPassword } from "../utils/encryptPassword.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//clear
const register = asyncHandler(async (req, res) => {
  let { handle, email, password, avatarURL } = req.body;
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
    handle,
    email,
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

  const alreadyExists = await Player.findOne({
    where: {
      email,
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

  otp = Number(otp);

  const otpDb = await OTP.findOne({
    where: {
      email,
    },
  });
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

  // console.log("database OTP", otpDb.OTP);

  if (otpDb.OTP !== otp) {
    return res.status(401).json(new ApiResponse(401, "", "Invalid OTP!!!"));
  }

  const encrptedPassword = await encrptPassword(otpDb.password);
  // console.log("encrptedPassword", encrptedPassword);

  const player = await Player.create({
    handle: otpDb.handle,
    email: otpDb.email,
    password: encrptedPassword,
    avatar: otpDb.avatar,
  });

  // console.log("player", player);

  await OTP.destroy({
    where: {
      email,
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
  // console.log("email : ", email);

  const player = await OTP.findOne({ where: { email } });

  if (!player) {
    return res
      .status(404)
      .json(new ApiResponse(404, "", "Email not found. Try registering again"));
  }

  const otp = generateOTP();

  const updateOTP = await OTP.update({ OTP: otp }, { where: { email } });
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

  if(!decodedIncomingRefreshToken.id){
    return res.status(401).json(new ApiResponse(401, "", "Invalid refreshToken"));
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

    console.log("token : ", token);

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

    player = player.dataValues;

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

export {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshAccessToken,
  logout,
  getCurrentPlayer,
};
