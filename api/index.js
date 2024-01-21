import express from "express";
import db from "./db.js";
import dotenv from "dotenv";
dotenv.config();

import userRouter from "./routes/user.route.js";

const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRouter);
