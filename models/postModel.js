const db = require('../config/db');


const postModel = {
  getPosts: (callback) => {
    db.query('SELECT * FROM post', (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  },

  deletePost: (post_num, callback) => {
    db.query('DELETE FROM post WHERE post_num = ?', [post_num], () => {
      callback();
    });
  },

  insertPost: (post_title, post_content, post_usernum, post_created_at, callback) => {
    db.query(
      'INSERT INTO post (post_title, post_content, post_usernum, post_created_at) VALUES (?, ?, ?, ?)',
      [post_title, post_content, post_usernum, post_created_at],
      () => {
        callback();
      }
    );
  },

  getPostById: (post_num, callback) => {
    db.query('SELECT * FROM post WHERE post_num = ?', [post_num], (error, result) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, result[0]);
      } // 이 아이디의 값들만 나옴
    });
  },

  updatePost: (post_title, post_content, post_updated_at, post_num, callback) => {
    db.query(
      'UPDATE post SET post_title = ?, post_content = ?, post_updated_at = ? WHERE post_num = ?',
      [post_title, post_content, post_updated_at, post_num],
      () => {
        callback();
      }
    );
  },

  incrementPostHit: (post_num, callback) => {
    db.query('UPDATE post SET post_hit = post_hit + 1 WHERE post_num = ?', [post_num], (error, results) => {
      if (error) {
        console.error('Error incrementing post hit:', error);
      }
      callback(error, results);
    });
  },

  getPostsByUserNum: (post_usernum, callback) => {
    db.query('SELECT * FROM post WHERE post_usernum = ?', [post_usernum], (error, results) => {
      if (error) {
        console.error('Error getpostByUserNum', null);
      }
      callback(null, results);
    })
  },
};

module.exports = postModel;