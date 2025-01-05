import jwt from "jsonwebtoken";

const generateAccessToken = (player) => {
  return jwt.sign(
    {
      id: player.id, //auto saved by mongodb
      email: player.email,
      handle: player.handle,
    },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

const generateRefreshToken = (player) => {
  return jwt.sign(
    {
      id: player.id,
    },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export { generateAccessToken, generateRefreshToken };
