import { ApiResponse } from "./ApiResponse.js";
import jwt from "jsonwebtoken";
import { Player } from "../models/index.js";
import { asyncHandler } from "./AsyncHandler.js";

//clear
const verifyJWT = asyncHandler(async (req, res, next) => {
  //   console.log("custom verifyJWT");

  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("token : ", token);

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, "", "Unauthorized Request"));
    }

    // Decode the token
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    console.log("decodedToken : ", decodedToken);
    
    if (!decodedToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, "", "Error decoding access token"));
    }


    // Fetch player
    // const player = await player.findOne({ id: decodedToken.id }).select(
    //   "-password -refreshToken"
    // );

    const player = await Player.findOne({
      attrbutes: { exclude: ["password", "refreshToken"] },
      where: {
        id: decodedToken.id
      },
    });

    if (!player) {
      return res
        .status(401)
        .json(
          new ApiResponse(401, "", "Unauthorized Request - player not found")
        );
    }

    req.player = player; // Attach player to request
    next(); // Proceed to next middleware
  } catch (error) {
    console.log("error here : ", error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(new ApiResponse(401, "", "Token expired. Please log in again."));
    }
    // throw new ApiError(401,"Unauthorized Request");
    return res
      .status(401)
      .json(new ApiResponse(401, "", "Unauthorized Request"));
  }
});

export {verifyJWT};