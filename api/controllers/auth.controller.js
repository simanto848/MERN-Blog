import bcrypt from "bcrypt";
import db from "../db.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return res.status(400).json({ message: "All fields are required" });
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
        res.status(500).json({ message: "Internal server error" });
      }
      if (data.length)
        return res.status(409).json({ message: "User already exists!" });

      // Hash the password
      const hashedPassword = bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPassword;

      // Insert the user into the database
      const sql = "INSERT INTO users SET ?";

      db.query(sql, newUser, (err, data) => {
        if (err) {
          res.status(500).json({ message: "Internal server error" });
        }
        res.status(201).json({ message: "User created successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
