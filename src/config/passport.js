import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Player } from "../models/index.js";
import { formattedDate } from "../utils/formattedDate.js";
import { Op } from "sequelize";
import { customAlphabet } from "nanoid";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://chess-backend-csre.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let player = await Player.findOne({
          where: {
            [Op.or]: [
              { googleId: profile.id },
              { email: profile.emails[0].value },
            ],
          },
        });

        if (!player) {
          const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
          const nanoid = customAlphabet(alphabet, 5); // 4-char unique suffix

          player = await Player.create({
            googleId: profile.id,
            handle: profile.displayName.toLowerCase().replace(/\s+/g, "") + nanoid(),
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value,
            rating: 1200,
            ratingHistory: [{ rating: 1200, date: formattedDate() }],
          });
          await player.save();
        }

        return done(null, player);
      } catch (err) {
        console.log("Error in Google Strategy:", err);

        return done(err, null);
      }
    }
  )
);

export default passport;
