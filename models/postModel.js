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
    db.query('SELECT mem_code FROM member WHERE mem_id = ?', [userId], (error, results) => {
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
          const userNum = results[0].mem_code;
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
        console.log('adfasdf')
        callback(null, results);
      }
    });
  },

  excludedUserNum: (post_usernum, callback) => {
    db.query(
      `SELECT post.*, COALESCE(comment.comment_count, 0) AS comment_count
      FROM post LEFT JOIN (
        SELECT post_num, COUNT(*) AS comment_count FROM comment
        GROUP BY post_num) AS comment ON post.post_num = comment.post_num
        WHERE post.post_usernum <> ?`, [post_usernum], (error, results) => {
      if (error) {
        console.error('Error getPostsExcludingUserNum', null);
        callback(error, null);
      }
      callback(null, results);
    });
  },

  // post 작성자의 닉네임 가져오기
  getNicknameByPostId: (post_num, callback) => {
    db.query(
      `SELECT m.mem_nickname, m.mem_profile
      FROM post p 
      JOIN member m ON p.post_usernum = m.mem_code 
      WHERE p.post_num = ?;`,
      [post_num],
      (error, results) => {
        if (error) {
          console.error(error);
        } else {
          if (results.length > 0) {
            const nickname = results[0].mem_nickname;
            const profile = results[0].mem_profile;
            callback(null, nickname, profile);
          } else {
            callback(null, null, null);
          }
        }
      }
    );
  },

  getPostTitle: (post_num, callback) => {
    db.query(
      `
        SELECT (
          SELECT post_num FROM post WHERE post_num < ? AND post_usernum <> 1 ORDER BY post_num DESC LIMIT 1
        ) AS previousPost,
        (
          SELECT post_num FROM post WHERE post_num > ? AND post_usernum <> 1 ORDER BY post_num ASC LIMIT 1
        ) AS nextPost;
      `,
      [post_num, post_num],
      (error, results) => {
        if (error) {
          console.error(error);
          callback(error, null, null);
        } else {
          const previousPost = results[0].previousPost;
          const nextPost = results[0].nextPost;

          // 서브쿼리로 title.
          db.query(
            `
              SELECT post_title FROM post WHERE post_num = ?;
            `,
            [previousPost], // 이전 글 post_title
            (error, prevResult) => {
              if (error) {
                console.error(error);
                callback(error, null, null);
              } else {
                const previousTitle = prevResult[0] ? prevResult[0].post_title : null;

                db.query(
                  `
                    SELECT post_title FROM post WHERE post_num = ?;
                  `,
                  [nextPost], // 다음 글 post_title
                  (error, nextResult) => {
                    if (error) {
                      console.error(error);
                      callback(error, null, null);
                    } else {
                      const nextTitle = nextResult[0] ? nextResult[0].post_title : null;
                      callback(null, previousPost, previousTitle, nextPost, nextTitle);
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  },
  
  postLike: (post_num) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE post SET post_like = post_like + 1 WHERE post_num = ?', [post_num], (error, result) => {
            if (error) {
                console.error('좋아요 실패:', error);
                reject(error);
            } else {
                // post_like 값 재조회
                db.query('SELECT post_like FROM post WHERE post_num = ?', [post_num], (error, rows) => {
                    if (error) {
                        console.error('post_like 조회 실패:', error);
                        reject(error);
                    } else {
                        const Like = rows[0].post_like;
                        resolve(Like);
                    }
                });
            }
        });
    });
},

};

const commentModel = {
  getComments: (post_usernum, callback) => {
    db.query(`
      SELECT * 
      FROM comment AS c 
      JOIN post AS p ON c.post_num = p.post_num 
      WHERE c.post_num = ?
      ORDER BY 
          CASE 
              WHEN c.cmt_refnum IS NULL THEN c.cmt_num
              ELSE c.cmt_refnum
          END ASC,
          c.cmt_refnum ASC
    `, [post_usernum], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  },

  insertComments: (post_num, cmt_content, cmt_usernum, cmt_created_at, cmt_refnum, callback) => {
    db.query(
      'INSERT INTO comment (post_num, cmt_content, cmt_usernum, cmt_created_at, cmt_refnum) VALUES (?, ?, ?, ?, ?)',
      [post_num, cmt_content, cmt_usernum, cmt_created_at, cmt_refnum],
      () => {
        callback();
      }
    );
  },

  deleteComments: (cmt_num, callback) => {
    db.query('DELETE FROM comment WHERE cmt_num = ?', [cmt_num], () => {
      callback();
    });
  },

  updateComments: (cmt_content, cmt_updated_at, cmt_num, callback) => {
    db.query(
      'UPDATE comment SET cmt_content = ?, cmt_updated_at = ? WHERE cmt_num = ?',
      [cmt_content, cmt_updated_at, cmt_num],
      () => {
        callback();
      }
    );
  },

  // 로그인 한 사람의 닉네임과 프로필 가져오기
  getMemberById: (mem_id, callback) => {
    db.query(
      'SELECT mem_nickname, mem_profile FROM member WHERE mem_id = ?',
      [mem_id],
      (error, results) => {
        if (error) {
          console.error(error);
        } else {
          if (results.length > 0) {
            const nickname = results[0].mem_nickname;
            const profile = results[0].mem_profile;
            callback(null, nickname, profile);
          } else {
            callback(null, null, null);
          }
        }
      }
    );
  },

  // 댓글 작성자의 닉네임과 프로필 가져오기
  getMemberByUserNum: (usernums, post_num, callback) => {
    const placeholders = new Array(usernums.length).fill('?').join(', '); // ?을 usernums 배열의 길이만큼 반복해서 생성
    const query = `
      SELECT c.*, m.mem_nickname, m.mem_profile 
      FROM comment AS c 
      JOIN member m ON c.cmt_usernum = m.mem_code
      WHERE c.post_num = ? AND c.cmt_usernum IN (${placeholders})
      ORDER BY 
          CASE 
              WHEN c.cmt_refnum IS NULL THEN c.cmt_num
              ELSE c.cmt_refnum
          END ASC,
          c.cmt_refnum ASC,
          c.cmt_created_at ASC;
    `;
    const params = [post_num, ...usernums]; // post_num과 usernums 배열을 합친 매개변수 배열

    db.query(query, params, (error, results) => {
      if (error) {
        callback(null, null); // 댓글 없을 때 null값 주기 error
      } else {
        const userInfo = results.map(result => ({
          mem_nickname: result.mem_nickname,
          mem_profile: result.mem_profile
        }));
        if (userInfo.length > 0) {
          callback(null, userInfo);
        } else {
          callback(null, null);
        }
      }
    });
  },
}

module.exports = { postModel, commentModel };