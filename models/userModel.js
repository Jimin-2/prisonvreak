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

// // 회원 탈퇴 처리
// exports.withdrawal = function (id, password, callback){
//   db.query('DELETE FROM member WHERE mem_id = ? AND mem_password = ?', [id, password], function (error, results, fields) {
//     if (error) {
//       callback(error, null);
//     } else {
//       callback(null, results);
//     }
//   });
// }

exports.withdrawal = function (id, password, callback) {
  db.query('UPDATE member SET is_withdrawn = 1 WHERE mem_id = ? AND mem_password = ?', [id, password], function (error, results) {
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
  db.query('SELECT * FROM member WHERE mem_nickname = ?', [username], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};

// 게임 room 확인
exports.checkRoom = function (web_userCode, vr_userCode, callback){

    db.query('SELECT * FROM room WHERE web_user = ? AND vr_user =?',
        [web_userCode, vr_userCode], function (error, data) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, data);
          }
        });
}

// 게임 room 생성
exports.createRoom = function (web_userCode, vr_userCode, device, callback){
  if(device==='vr') {
    db.query('INSERT INTO room (web_user, vr_user, vr_state) VALUES (?, ?, "ready")',
        [web_userCode, vr_userCode], function (error, data) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, data);
          }
        });
  }else if(device==='web'){
  db.query('INSERT INTO room (web_user, web_state, vr_user) VALUES (?, "ready", ?)',
      [web_userCode, vr_userCode], function (error, data) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, data);
        }
      });
  }
}

// 게임 room 입장
exports.joinRoom = function (web_userCode, vr_userCode, device, callback ) {
  if(device==='vr'){
    db.query('UPDATE room SET vr_state = ? WHERE web_user = ? AND vr_user', ["ready", web_userCode, vr_userCode], function (error, results, fields) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  } else {
    db.query('UPDATE room SET web_state = ? WHERE web_user = ? AND vr_user', ["ready", web_userCode, vr_userCode], function (error, results, fields) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  }
}