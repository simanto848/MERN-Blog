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
  const id = new Date().getTime();
  const newPost = {
    ...req.body,
    id,
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

export const getPosts = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const postId = req.query.postId;
    const category = req.query.category;
    const slug = req.query.slug;
    const title = req.query.title;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sql = `SELECT * FROM posts WHERE userId = ? OR id = ? OR category = ? OR slug = ? OR title = ? ORDER BY updated_at DESC LIMIT ?, ?`;
    db.query(
      sql,
      [userId, postId, category, slug, title, startIndex, limit],
      (err, data) => {
        if (err) {
          return next(errorHandler(500, err.message));
        }
        res.status(200).json(data);
      }
    );
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id != req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this post"));
  }

  try {
    // Check if the post exists
    const sql = `SELECT * FROM posts WHERE id = ?`;
    db.query(sql, [req.params.postId], (err, data) => {
      if (err) {
        return next(errorHandler(500, err.message));
      }
      if (data.length === 0) {
        return next(errorHandler(404, "Post not found"));
      }

      // Delete the post
      const sql = `DELETE FROM posts WHERE id = ?`;
      db.query(sql, [req.params.postId], (err, data) => {
        if (err) {
          return next(errorHandler(500, err.message));
        }
        res.status(200).json({ message: "Post deleted successfully" });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id != req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    const category = req.body.category;
    const image = req.body.image;

    const sql = ` UPDATE posts SET title = ?, content = ?, category = ?, image = ? WHERE id = ? `;
    const updateResult = db.query(sql, [
      title,
      content,
      category,
      image,
      postId,
    ]);

    if (updateResult.affectedRows === 0) {
      return next(errorHandler(404, "Post not found"));
    }
    const updatedPost = db.query("SELECT * FROM posts WHERE id = ?", [postId]);

    res.status(200).json(updatedPost[0]);
  } catch (error) {
    next(error);
  }
};
