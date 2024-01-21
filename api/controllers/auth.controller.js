import bcrypt from "bcrypt";
import db from "../db.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    next(errorHandler(400, "All fields are required"));
  }

  const newUser = {
    username,
    email,
    password,
  };

  try {
    // Check if the user already exists
    const sql = "SELECT * FROM users WHERE username = ? OR email = ?";

    db.query(sql, [username, email], (err, data) => {
      if (err) {
        next(errorHandler(500, "Internal server error"));
      }
      if (data.length)
        next(errorHandler(400, "Username or email already exists"));

      // Hash the password
      const hashedPassword = bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPassword;

      // Insert the user into the database
      const sql = "INSERT INTO users SET ?";

      db.query(sql, newUser, (err, data) => {
        if (err) {
          next(errorHandler(500, "Internal server error"));
        }
        res.status(201).json({ message: "User created successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
