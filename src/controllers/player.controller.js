import { Op } from "sequelize";
import { OTP, Player } from "../models/index.js";
import { generateOTP, sendOTPThroughEmail } from "../utils/otp_generator.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { encrptPassword } from "../utils/encryptPassword.js";

//clear
const register = asyncHandler(async (req, res) => {
  const { handle, email, password, avatarURL } = req.body;
  if (!handle || !email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Please provide all the required fields"));
  }
  console.log(req.body);
  console.log("avatarURL", avatarURL);

  let exists = await Player.findOne({
    where: {
      [Op.or]: [{ email }, { handle }],
    },
  });
  console.log("exists", exists);

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
  console.log("otpPlayer", otpPlayer);

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

const verifyOTP = asyncHandler(async (req, res) => {
  let { email, otp } = req.body;
  if (!email || !otp) {
    return res
      .status(409)
      .json(new ApiResponse(409, "", "Please provide email and otp"));
  }

  otp = Number(otp);

  console.log("email", email);
  console.log("otp", otp);

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

  console.log("database OTP", otpDb.OTP);

  if (otpDb.OTP !== otp) {
    return res.status(401).json(new ApiResponse(401, "", "Invalid OTP!!!"));
  }

  const encrptedPassword = await encrptPassword(otpDb.password);
  console.log("encrptedPassword", encrptedPassword);

  const player = await Player.create({
    handle: otpDb.handle,
    email: otpDb.email,
    password: encrptedPassword,
    avatar: otpDb.avatar,
  });

  console.log("player", player);

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

// const login = asyncHandler(async (req, res) => {
//   const { email, handle, password } = req.body;
//   if ((!email || !handle) && !password) {
//     return res
//       .status(400)
//       .json(new ApiResponse(400, "", "Please provide all the required fields"));
//   }

//   const player = await player.findOne({
//     where: {
//       [Op.or]: [{ email }, { handle }],
//     },
//   });


//   if(!player){
//     return res.status(404).json(new ApiResponse(404, "", "Player not found"));
//   }



// });

export { register, verifyOTP };
