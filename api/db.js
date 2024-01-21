// File: db.js
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const mysqlConnection = mysql.createConnection({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    throw err;
  }
  console.log("Connected to database");
});

mysqlConnection.on("end", () => {
  console.log("Database connection closed");
});

export default mysqlConnection;
