import { errorHandler } from "../utils/error.js";
import bycrypt from "bcrypt";
import db from "../db.js";

export const test = (req, res) => {
  res.json({ message: "Hello world" });
};
//   const { username, email, password } = req.body;
//   const userId = req.params.userId;

//   if (req.user.id != userId) {
//     return next(errorHandler(403, "You are not allowed to update the user"));
//   }
//   if (password < 6) {
//     return next(errorHandler(400, "Password must be at least 6 characters"));
//   }

//   if (username) {
//     if (username.length < 7 || username.length > 20) {
//       return next(
//         errorHandler(400, "Username must be between 7 and 20 characters")
//       );
//     }
//     if (username.includes(" ")) {
//       return next(errorHandler(400, "Username must not contain spaces"));
//     }
//     if (username !== username.toLowerCase()) {
//       return next(errorHandler(400, "Username must be lowercase"));
//     }
//     // if (username.match(/^[a-zA-Z0-9]+$/)) {
//     //   return next(
//     //     errorHandler(400, "Username must contain only letters and numbers")
//     //   );
//     // }

//     try {
//       const sql = `UPDATE users set username = ? WHERE id = ?`;
//       db.query(sql, [username, userId], (err, data) => {
//         if (err) {
//           return next(errorHandler(500, "Internal server error"));
//         }

//         const updateUserData = new Promise((resolve, reject) => {
//           const selectSql = `SELECT * FROM users WHERE id = ?`;
//           db.query(selectSql, [userId], (selectErr, SelectData) => {
//             if (selectErr) {
//               reject(errorHandler(500, "Internal server error"));
//             }
//             resolve(SelectData[0]);
//           });
//         });
//         res.status(200).json({
//           success: true,
//           message: "Username has been updated",
//           user: updateUserData,
//         });
//       });
//     } catch (error) {
//       next(errorHandler(400, error.message));
//     }
//   }

//   if (email) {
//     if (!email.includes("@") || !email.includes(".")) {
//       return next(errorHandler(400, "Invalid email"));
//     }

//     try {
//       const sql = `UPDATE users SET email = ? WHERE id = ?`;
//       db.query(sql, [email, userId], async (err, data) => {
//         if (err) {
//           return next(errorHandler(500, "Internal server error"));
//         }

//         // Fetch the updated user information from the database
//         const updatedUserData = await new Promise((resolve, reject) => {
//           const selectSql = `SELECT * FROM users WHERE id = ?`;
//           db.query(selectSql, [userId], (selectErr, selectData) => {
//             if (selectErr) {
//               reject(errorHandler(500, "Internal server error"));
//             }
//             resolve(selectData[0]);
//           });
//         });

//         res.status(200).json({
//           success: true,
//           message: "Email has been updated",
//           user: updatedUserData,
//         });
//       });
//     } catch (error) {
//       next(errorHandler(400, error.message));
//     }
//   }

//   if (password) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//       const sql = `UPDATE users SET password = ? WHERE id = ?`;
//       db.query(sql, [hashedPassword, userId], async (err, data) => {
//         if (err) {
//           return next(errorHandler(500, "Internal server error"));
//         }

//         // Fetch the updated user information from the database
//         const updatedUserData = await new Promise((resolve, reject) => {
//           const selectSql = `SELECT * FROM users WHERE id = ?`;
//           db.query(selectSql, [userId], (selectErr, selectData) => {
//             if (selectErr) {
//               reject(errorHandler(500, "Internal server error"));
//             }
//             resolve(selectData[0]);
//           });
//         });

//         res.status(200).json({
//           success: true,
//           message: "Password has been updated",
//           user: updatedUserData,
//         });
//       });
//     } catch (error) {
//       next(errorHandler(400, error.message));
//     }
//   }
// };

export const updateUser = async (req, res, next) => {
  const { username, email, password, profilePicture } = req.body;
  const userId = req.params.userId;

  if (req.user.id != userId) {
    return next(errorHandler(403, "You are not allowed to update the user"));
  }

  if (password && password.length < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters"));
  }

  const updateFields = {};

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
    updateFields.username = username;
  }

  if (email) {
    if (!email.includes("@") || !email.includes(".")) {
      return next(errorHandler(400, "Invalid email"));
    }
    updateFields.email = email;
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.password = hashedPassword;
  }

  if (profilePicture) {
    updateFields.profilePicture = profilePicture;
  }

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const sql = `UPDATE users SET ? WHERE id = ?`;
    db.query(sql, [updateFields, userId], async (err, data) => {
      if (err) {
        return next(errorHandler(500, "Internal server error"));
      }

      const updatedUserData = await new Promise((resolve, reject) => {
        const selectSql = `SELECT * FROM users WHERE id = ?`;
        db.query(selectSql, [userId], (selectErr, selectData) => {
          if (selectErr) {
            reject(errorHandler(500, "Internal server error"));
          }
          resolve(selectData[0]);
        });
      });

      res.status(200).json(updatedUserData);
    });
  } catch (error) {
    next(errorHandler(400, error.message));
  }
};

export const deleteUser = (req, res, next) => {
  const userId = req.params.userId;

  if (req.user.id != userId) {
    return next(errorHandler(403, "You are not allowed to delete the user"));
  }

  try {
    const sql = `DELETE FROM users WHERE id = ?`;

    db.query(sql, [userId], (err, data) => {
      if (err) {
        return next(errorHandler(500, "Internal server error"));
      }

      res.status(200).json({ success: true, message: "User has been deleted" });
    });
  } catch (error) {
    next(errorHandler(400, error.message));
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(errorHandler(400, error.message));
  }
};

export const getUsers = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "You are not allowed to view all users"));
    }

    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;

    const getUsersSQL =
      "SELECT id, username, email, created_at, updated_at FROM users LIMIT ?, ?";
    const getTotalUsersSQL = "SELECT COUNT(*) AS totalUsers FROM users";

    const [users, totalUsersResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(getUsersSQL, [startIndex, limit], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.query(getTotalUsersSQL, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data[0].totalUsers);
          }
        });
      }),
    ]);

    const usersWithoutPassword = users.map((user) => {
      const { id, username, email, created_at, updated_at } = user;
      return { id, username, email, created_at, updated_at };
    });

    res.status(200).json({
      totalUsers: totalUsersResult,
      users: usersWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
