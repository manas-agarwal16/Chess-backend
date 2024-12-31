import cron from "node-cron";
import OtpModel from "../models/otps.models";
import { Op } from "sequelize";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  await OtpModel.destroy({
    where: {
      [Op.lt]: now,
    },
  });
  console.log("Cron job ran");
});
