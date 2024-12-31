import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/connectDB.js";
import { app } from "./app.js";

(async () => {
  try {
    const res = await connectDB()
      .then(() => {        
        console.log("DB Connected , index.js");
        app.listen(process.env.PORT || 4000, () => {
          console.log(`Server is running on port ${process.env.PORT}`);
        });
      })
      .catch((error) => {
        console.log("Error in connecting to DB , index.js", error);
      });
  } catch (error) {
    console.log("Error in connecting to DB , index.js", error);
  }
})();
