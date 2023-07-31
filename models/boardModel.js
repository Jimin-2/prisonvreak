const db = require('../config/db');


const boardModel = {
  getPosts: (callback) => {
    db.query('SELECT * FROM post', (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  },

  deletePost: (postNum, callback) => {
    db.query('DELETE FROM post WHERE post_num = ?', [postNum], () => {
      callback();
    });
  },

  insertPost: (title, content, usernum, createdAt, callback) => {
    db.query(
      'INSERT INTO post (post_title, post_content, post_usernum, post_created_at) VALUES (?, ?, ?, ?)',
      [title, content, usernum, createdAt],
      () => {
        callback();
      }
    );
  },

  getPostById: (postNum, callback) => {
    db.query('SELECT * FROM post WHERE post_num = ?', [postNum], (error, result) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, result[0]);
      }
    });
  },

  updatePost: (title, content, updatedAt, postNum, callback) => {
    db.query(
      'UPDATE post SET post_title = ?, post_content = ?, post_updated_at = ? WHERE post_num = ?',
      [title, content, updatedAt, postNum],
      () => {
        callback();
      }
    );
  },
};

const postModel = {
  getPostById: (postNum, callback) => {
      db.query('SELECT * FROM post WHERE post_num = ?', [postNum], (error, result) => {
          if (error) {
              callback(error, null);
          } else {
              callback(null, result[0]);
          }
      });
  },
}

module.exports = { boardModel, postModel };