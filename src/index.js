import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/connectDB.js";
import { app, server, io } from "./app.js";
import "./utils/nodeCron.js";

(async () => {
  try {
    const res = await connectDB()
      .then(() => {
        console.log("DB Connected , index.js");
        server.listen(process.env.PORT || 4000, () => {
          console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`);
        });
      })
      .catch((error) => {
        console.log("Error in connecting to DB , index.js", error);
      });
  } catch (error) {
    console.log("Error in connecting to DB , index.js", error);
  }
})();
