import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ORIGIN.split(",") || "*";

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" })); //for incoming requests in jdon format
app.use(express.urlencoded({ extended: true })); // for incoming requests in url
// app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});


export {app};