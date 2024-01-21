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

export default mysqlConnection;
