import db from "../db.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    const getPostId = postId.postId;
    const id = new Date().getTime().toString();

    if (userId != req.user.id) {
      return next(
        errorHandler(401, "You are not authorized to perform this action")
      );
    }
    const sql = `INSERT INTO comment SET ?`;
    let comment = {
      id,
      content,
      postId: getPostId,
      userId,
    };

    db.query(sql, comment, (err, result) => {
      if (err) {
        console.log(err);
        return next(errorHandler(500, "Internal Server Error"));
      }
      const sql = `SELECT * FROM comment WHERE id = ?`;
      db.query(sql, id, (err, result) => {
        if (err) {
          return next(errorHandler(500, "Internal Server Error"));
        }
        res
          .status(201)
          .json({ message: "Comment created", comment: result[0] });
      });
    });
  } catch (error) {
    next(error);
  }
};
