const db = require('../config/db');

// 회원가입 처리
/*exports.registerUser = function (name, nickname, id, password, phone, email, provider, callback) {
  db.query('INSERT INTO member (mem_name, mem_nickname, mem_id, mem_password, mem_phone, mem_email, mem_provider) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, nickname, id, password, phone, email, snsId, provider], function (error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, data);
      }
    });
};*/

exports.checkIdAvailability = function (id,callback){
  db.query('SELECT * FROM member WHERE mem_id = ?', [id], function(error, results, fields) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
};


// 아이디와 비밀번호로 사용자 정보 조회
exports.loginProcess = function (id, password, callback) {
  db.query('SELECT * FROM member WHERE mem_id = ? AND mem_password = ?', [id, password], function (error, results, fields) {
    if (error) {
      callback(error, null);
    } else {

      console.log(results);
      callback(null, results);
    }
  });
};

// 회원가입 처리 - 카카오 로그인으로 가입
exports.registerUserWithKakao = function (name, nickname, kakaoUserId, phone, email, callback) {
  db.query('INSERT INTO member (mem_name, mem_nickname, mem_id, mem_phone, mem_email, mem_provider) VALUES (?, ?, ?, ?, ?, "kakao")',
    [name, nickname, kakaoUserId, phone, email], function (error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, data);
      }
    });
};

// 회원가입 처리 - 구글 로그인으로 가입
exports.registerUserWithGoogle = function (name, nickname, googleUserId, phone, email, callback) {
  db.query('INSERT INTO member (mem_name, mem_nickname, mem_id, mem_phone, mem_email, mem_provider) VALUES (?, ?, ?, ?, ?, "google")',
    [name, nickname, googleUserId, phone, email], function (error, data) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, data);
      }
    });
};

// 회원가입 처리 - 일반 가입
exports.registerUserLocal = function (name, nickname, id, password, phone, email, callback) {
  db.query('INSERT INTO member (mem_name, mem_nickname, mem_id, mem_password, mem_phone, mem_email, mem_snsid, mem_provider) VALUES (?, ?, ?, ?, ?, ?, NULL, "local")',
    [name, nickname, id, password, phone, email], function (error, data) {
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
