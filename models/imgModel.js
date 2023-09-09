const db = require("../config/db");

exports.getProfileImg = function (id, callback) {
    db.query('SELECT mem_profile FROM users WHERE mem_id = ?', [id], function (error, results, fields) {
        if (error) {
            callback(error, null);
        } else {
            if (results.length > 0) {
                // 사용자가 이미지 URL을 가지고 있다면 해당 URL을 반환
                callback(null, results[0].mem_profile);
            } else {
                // 사용자가 이미지 URL을 가지고 있지 않다면 기본 이미지 URL 반환
                callback(null, 'https://prisonvreak.s3.ap-northeast-2.amazonaws.com/profile/default.jpg');
            }
        }
    });
};