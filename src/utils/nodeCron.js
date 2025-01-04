import cron from "node-cron";
import { Op } from "sequelize";
import { OTP } from "../models/index.js";

//clear
cron.schedule("* * * * *", async () => {
  // console.log("here");

  const now = new Date();
  await OTP.destroy({
    where: {
      expiresAt: {
        [Op.lt]: now,
      },
    },
  });
  // console.log("Cron job ran" );
});
