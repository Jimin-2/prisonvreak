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

  insertPost: (post_title, post_image, post_content, post_usernum, post_created_at, callback) => {
    db.query(
      'INSERT INTO post (post_title, post_image, post_content, post_usernum, post_created_at) VALUES (?, ?, ?, ?, ?)',
      [post_title, post_image, post_content, post_usernum, post_created_at],
      () => {
        callback();
      }
    );
  },

  getMemNumByMemId: (userId, callback) => {
    // MySQL 쿼리를 통해 user_id로 사용자 정보 조회
    db.query('SELECT mem_num FROM member WHERE mem_id = ?', [userId], (error, results) => {
      if (error) {
        console.error(error);
        callback(error, null);
        return;
      } else {
        if (results.length === 0) {
          // 사용자 정보가 없을 경우
          callback(null, null);
        } else {
          // 사용자 정보가 있을 경우 user_num 반환
          const userNum = results[0].mem_num;
          callback(null, userNum);
        }
      }
    });
  },

  getPostById: (post_num, callback) => {
    db.query('SELECT * FROM post WHERE post_num = ?', [post_num], (error, result) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, result[0]);
      }
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

  searchKeyword: (keyword, post_usernum, callback) => { // 검색 기능
    const searchKeyword = `%${keyword}%`;
    db.query('SELECT * FROM post WHERE post_title LIKE ? AND post_usernum = ?', [searchKeyword, post_usernum], (error, results) => {
      if (error) {
        console.error(error);
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  },

  excludedUserNum: (post_usernum, callback) => {
    db.query('SELECT * FROM post WHERE post_usernum <> ?', [post_usernum], (error, results) => {
      if (error) {
        console.error('Error getPostsExcludingUserNum', null);
        callback(error, null);
      }
      callback(null, results);
    });
  },
};

const commentModel = {
  getComments: (post_usernum, callback) => {
    db.query('SELECT * FROM comment AS c JOIN post AS p ON c.post_num = p.post_num WHERE c.post_num = ?', [post_usernum], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  },

  insertComments: (post_num, cmt_content, cmt_usernum, cmt_created_at, callback) => {

    db.query(
      'INSERT INTO comment (post_num, cmt_content, cmt_usernum, cmt_created_at) VALUES (?, ?, ?, ?)',
      [post_num, cmt_content, cmt_usernum, cmt_created_at],
      () => {
        callback();
      }
    );

  },

}

module.exports = { postModel, commentModel };
