import { Op } from "sequelize";
import { OTP, Player } from "../models/index.js";
import { generateOTP, sendOTPThroughEmail } from "../utils/otp_generator.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { encrptPassword } from "../utils/encryptPassword.js";

const registerPlayer = asyncHandler(async (req, res) => {
  const { handle, email, password, avatarURL } = req.body;
  if (!handle || !email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, "", "Please provide all the required fields"));
  }
  console.log(req.body);
  console.log("avatarURL", avatarURL);

  // let exists = await Player.findOne({
  //   where: {
  //     [Op.or]: [{ email }, { handle }],
  //   },
  // });
  let exists = await Player.findOne({
    where: {
      handle: handle,
    },
  });

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

  const encrptedPassword = await encrptPassword(password);
  console.log("encrptedPassword", encrptedPassword);

  const otp = generateOTP();

  const otpPlayer = await OTP.create({
    OTP: otp,
    handle,
    email,
    password: encrptedPassword,
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

export { registerPlayer };
