import db from "../db.js";
import { errorHandler } from "../utils/error.js";

export const create = async (req, res, next) => {
  const { title, content } = req.body;
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }
  if (!title || !content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = {
    ...req.body,
    slug,
    userId: req.user.id,
  };

  try {
    const sql = `INSERT INTO posts SET ?`;
    db.query(sql, newPost, (err, data) => {
      if (err) {
        return next(errorHandler(500, err.message));
      }

      const sql = `SELECT * FROM posts WHERE title = ? LIMIT 1`;
      db.query(sql, [title], (err, data) => {
        if (err) {
          return next(errorHandler(500, err.message));
        }
        res.status(201).json(data[0]);
      });
    });
  } catch (error) {
    next(error);
  }
};
