import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/connectDB.js";
import { app, server, io } from "./app.js";
import "./utils/nodeCron.js";

(async () => {
  try {
    const port = process.env.PORT || 5000; // Fallback to 5000 for local testing
    console.log(`Attempting to start server on port: ${port}`);

    const res = await connectDB()
      .then(() => {
        console.log("DB Connected , index.js");
        server.listen(port, () => {
          console.log(`Server is running on http://localhost:${port}`);
        });
      })
      .catch((error) => {
        console.log("Error in connecting to DB , index.js", error);
      });
  } catch (error) {
    console.log("Error in connecting to DB , index.js", error);
  }
})();
