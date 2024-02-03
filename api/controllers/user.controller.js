import { errorHandler } from "../utils/error.js";
import bycrypt from "bcrypt";
import db from "../db.js";

export const test = (req, res) => {
  res.json({ message: "Hello world" });
};

export const updateUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  const userId = req.params.userId;

  if (req.user.id != userId) {
    return next(errorHandler(403, "You are not allowed to update the user"));
  }
  if (password < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters"));
  }

  if (username) {
    if (username.length < 7 || username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (username.includes(" ")) {
      return next(errorHandler(400, "Username must not contain spaces"));
    }
    if (username !== username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    // if (username.match(/^[a-zA-Z0-9]+$/)) {
    //   return next(
    //     errorHandler(400, "Username must contain only letters and numbers")
    //   );
    // }

    try {
      const sql = `UPDATE users set username = ? WHERE id = ?`;
      db.query(sql, [username, userId], (err, data) => {
        if (err) {
          return next(errorHandler(500, "Internal server error"));
        }

        res
          .status(200)
          .json({ success: true, message: "Username has been updated" });
      });
    } catch (error) {
      next(errorHandler(400, error.message));
    }
  }

  if (email) {
    if (!email.includes("@") || !email.includes(".")) {
      return next(errorHandler(400, "Invalid email"));
    }

    try {
      const sql = `UPDATE users set email = ? WHERE id = ?`;
      db.query(sql, [email, userId], (err, data) => {
        if (err) {
          return next(errorHandler(500, "Internal server error"));
        }

        res
          .status(200)
          .json({ success: true, message: "Email has been updated" });
      });
    } catch (error) {
      next(errorHandler(400, error.message));
    }
  }

  if (password) {
    const hashedPassword = await bycrypt.hash(password, 10);
    try {
      const sql = `UPDATE users set password = ? WHERE id = ?`;
      db.query(sql, [hashedPassword, userId], (err, data) => {
        if (err) {
          return next(errorHandler(500, "Internal server error"));
        }

        res
          .status(200)
          .json({ success: true, message: "Password has been updated" });
      });
    } catch (error) {
      next(errorHandler(400, error.message));
    }
  }
};
