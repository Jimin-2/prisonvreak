const db = require('../config/db');

exports.checkIdAvailability = function (id,callback){
  db.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

exports.checkNicknameAvailability = function (nickname,callback){
  db.query('SELECT * FROM member WHERE mem_nickname = ?', [nickname], function(error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

exports.checkEmailAvailability = function (email,callback){
  db.query('SELECT * FROM member WHERE mem_email = ?', [email], function(error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

exports.checkUsercodeAvailability = function (usercode,callback){
  db.query('SELECT * FROM member WHERE mem_code = ?', [usercode], function(error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

// 아이디와 비밀번호로 사용자 정보 조회
exports.loginProcess = function (id, password, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ? AND mem_password = ? AND is_withdrawn = 0', [id, password], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      console.log(results);
      callback(null, results);
    }
  });
};

// 유저코드와 비밀번호로 사용자 정보 조회
exports.vrLoginProcess = function (userCode, password, callback) {
  db.query('SELECT * FROM member WHERE mem_code = ? AND mem_password = ?', [userCode, password], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {

      console.log(results);
      callback(null, results);
    }
  });
};

// 회원가입 처리 - 카카오 로그인으로 가입
exports.registerUserWithKakao = function (usercode, pwd, name, nickname, kakaoUserId, phone, email, callback) {
  const defaultProfileImageUrl = 'https://prisonvreak.s3.ap-northeast-2.amazonaws.com/profile/default-profile.jpg'; // S3 기본 이미지 URL
  db.query('INSERT INTO member (mem_code, mem_password, mem_name, mem_nickname, mem_id, mem_phone, mem_email, mem_provider,mem_profile) VALUES (?, ?, ?, ?, ?, ?, ?, "kakao",?)',
      [usercode, pwd, name, nickname, kakaoUserId, phone, email, defaultProfileImageUrl], function (error, data) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, data);
        }
      });
};

// 회원가입 처리 - 구글 로그인으로 가입
exports.registerUserWithGoogle = function (usercode, pwd, name, nickname, googleUserId, phone, email, callback) {
  const defaultProfileImageUrl = 'https://prisonvreak.s3.ap-northeast-2.amazonaws.com/profile/default-profile.jpg'; // S3 기본 이미지 URL
  db.query('INSERT INTO member (mem_code, mem_password, mem_name, mem_nickname, mem_id, mem_phone, mem_email, mem_provider, mem_profile) VALUES (?, ?, ?, ?, ?, ?, ?, "google",?)',
      [usercode, pwd, name, nickname, googleUserId, phone, email, defaultProfileImageUrl], function (error, data) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, data);
        }
      });
};

// 회원가입 처리 - 일반 가입
exports.registerUserLocal = function (usercode, name, nickname, id, password, phone, email, callback) {
  const defaultProfileImageUrl = 'https://prisonvreak.s3.ap-northeast-2.amazonaws.com/profile/default-profile.jpg'; // S3 기본 이미지 URL

  db.query('INSERT INTO member (mem_code, mem_name, mem_nickname, mem_id, mem_password, mem_phone, mem_email, mem_provider, mem_profile) VALUES (?, ?, ?, ?, ?, ?, ?, "local", ?)',
      [usercode, name, nickname, id, password, phone, email, defaultProfileImageUrl], function (error, data) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, data);
        }
      });
};


// 카카오 아이디로 사용자 정보 조회
exports.getUserByKakaoId = function (kakaoUserId, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ?', [kakaoUserId], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

// 구글 아이디로 사용자 정보 조회
exports.getUserByGoogleId = function (googleUserId, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ?', [googleUserId], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

//아이디 찾기
exports.findUserId = function (name, email, callback) {
  db.query('SELECT mem_id FROM member WHERE mem_name = ? AND mem_email = ? AND is_withdrawn = 0', [name, email], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

//비밀번호 찾기 - 사용자 일치 정보 조회
exports.findUserForPasswordReset = function (id, name, email, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ? AND mem_name = ? AND mem_email = ?', [id, name, email], function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

//임시 비밀번호 생성 및 업데이트
exports.updateTemporaryPassword = function (id, temporaryPassword, callback) {
  db.query('UPDATE member SET mem_password = ? WHERE mem_id = ?', [temporaryPassword, id], function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

// 마이페이지 정보 불러오기
exports.getUserProfile = function (id, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ?', [id], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

exports.getMyProfile = function (id, password, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ? AND mem_password = ?', [id, password], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

//개인정보 수정
exports.updateUserInfo = function (id, nickname, phone, email, callback) {
  db.query('UPDATE member SET mem_nickname = ?, mem_email = ?, mem_phone = ? WHERE mem_id = ?', [nickname, email, phone, id], function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

//비밀번호 변경
exports.updateUserPassword = function (id, password, callback) {
  db.query('UPDATE member SET mem_password = ? WHERE mem_id = ?', [password, id], function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

// 회원 탈퇴 처리
exports.withdrawal = function (id, password, callback){
   db.query('DELETE FROM member WHERE mem_id = ? AND mem_password = ?', [id, password], function (error, results, fields) {
     if (error) {
       callback(error, null);
     } else {
       callback(null, results);
     }
   });
}

//프로필 업데이트
exports.updateProfile = function (userId, imageURL, callback ) {
  db.query('UPDATE member SET mem_profile = ? WHERE mem_id = ?', [imageURL, userId], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

exports.deleteProfile = function (userId, imageURL, callback ){
  const defaultProfileImageUrl = 'https://prisonvreak.s3.ap-northeast-2.amazonaws.com/profile/default-profile.jpg'; // S3 기본 이미지 URL
  db.query('UPDATE member SET mem_profile = ? WHERE mem_id = ?', [defaultProfileImageUrl, userId], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

// 한줄 소개 수정
exports.updateProfileIntro = function (userId, newIntro, callback ) {
  db.query('UPDATE member SET mem_intro = ? WHERE mem_id = ?', [newIntro, userId], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

exports.getUserProfileByUsername = function (username, callback) {
  db.query(`
    SELECT
        vr.formatted_game_clear_time AS vr_clear_time,
        web.formatted_game_clear_time AS web_clear_time,
        m.*
    FROM (
        SELECT
            CONCAT(
                LPAD(FLOOR((r.game_clear_time / 60000) % 60), 2, '0'), ':',
                LPAD(FLOOR((r.game_clear_time / 1000) % 60), 2, '0'), '.',
                LPAD(r.game_clear_time % 1000, 3, '0')
            ) AS formatted_game_clear_time,
            r.vr_user AS user_code
        FROM prisonvreak.game_rank AS r
        WHERE r.game_clear_time = (
            SELECT MIN(game_clear_time)
            FROM prisonvreak.game_rank
            WHERE vr_user = r.vr_user
        )
    ) AS vr
    LEFT JOIN (
        SELECT
            CONCAT(
                LPAD(FLOOR((r.game_clear_time / 60000) % 60), 2, '0'), ':',
                LPAD(FLOOR((r.game_clear_time / 1000) % 60), 2, '0'), '.',
                LPAD(r.game_clear_time % 1000, 3, '0')
            ) AS formatted_game_clear_time,
            r.web_user AS user_code
        FROM prisonvreak.game_rank AS r
        WHERE r.game_clear_time = (
            SELECT MIN(game_clear_time)
            FROM prisonvreak.game_rank
            WHERE web_user = r.web_user
        )
    ) AS web ON vr.user_code = web.user_code
    RIGHT JOIN prisonvreak.member AS m ON vr.user_code = m.mem_code
    WHERE m.mem_nickname = ?;`, [username], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

exports.getUserProfileByNickname = function (nickname, callback) {
  db.query('SELECT * FROM member WHERE mem_nickname = ?', [nickname], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};