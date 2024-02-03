import bcrypt from "bcrypt";
import db from "../db.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

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
    return next(errorHandler(400, "All fields are required"));
  }

  const newUser = {
    username,
    email,
    password,
  };

  try {
    // Check if the user already exists
    const sql = "SELECT * FROM users WHERE username = ? OR email = ?";

    db.query(sql, [username, email], async (err, data) => {
      if (err) {
        return next(errorHandler(500, "Internal server error"));
      }
      if (data.length)
        return next(errorHandler(400, "Username or email already exists"));

      // Hash the password
      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPassword;

      // Insert the user into the database
      const sql = "INSERT INTO users SET ?";

      db.query(sql, newUser, (err, data) => {
        if (err) {
          return next(errorHandler(500, "Internal server error"));
        }
        return res
          .status(201)
          .json({ success: true, message: "User created successfully" });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, data) => {
      if (err) {
        return next(errorHandler(500, "Internal server error"));
      }
      if (!data.length)
        return next(errorHandler(400, "Email or password is incorrect"));

      const isPasswordCorrect = await bcrypt.compare(
        password,
        data[0].password
      );

      if (!isPasswordCorrect)
        return next(errorHandler(400, "Email or password is incorrect"));

      const token = jwt.sign(
        {
          id: data[0].id,
          isAdmin: data[0].isAdmin,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      delete data[0].password;

      data[0].success = true;

      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(data[0]);
    });
  } catch (error) {
    return next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    const getUserSql = "SELECT * FROM users WHERE email = ?";
    db.query(getUserSql, [email], async (err, userData) => {
      if (err) {
        return next(errorHandler(500, "Error checking existing user"));
      }

      if (!userData.length) {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        const newUser = {
          username:
            name.toLowerCase().split(" ").join("") +
            Math.random().toString(9).slice(-4),
          email,
          password: hashedPassword,
          profilePicture: googlePhotoUrl,
        };

        const insertUserSql = "INSERT INTO users SET ?";
        db.query(insertUserSql, newUser, (err, insertUserData) => {
          if (err) {
            return next(errorHandler(500, "Error inserting new user"));
          }

          const token = jwt.sign(
            {
              id: insertUserData.insertId,
              isAdmin: insertUserData.isAdmin,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

          delete newUser.password;
          newUser.success = true;

          return res
            .status(200)
            .cookie("access_token", token, {
              httpOnly: true,
            })
            .json(newUser);
        });
      } else {
        // User already exists, send the data in the response
        const user = userData[0];
        delete user.password;
        user.success = true;

        const token = jwt.sign(
          {
            id: userData.insertId,
            isAdmin: userData.isAdmin,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        return res
          .status(200)
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .json(user);
      }
    });
  } catch (error) {
    console.error("Error in Google authentication:", error);
    next(errorHandler(500, "Internal server error"));
  }
};
