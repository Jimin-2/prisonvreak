const db = require('../config/db');

// 게임 room 확인
exports.checkRoom = function (web_userCode, vr_userCode, callback){

    db.query(`SELECT * FROM room WHERE web_user = ? AND vr_user =?`,
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
        db.query(`INSERT INTO room (web_user, vr_user, vr_state) VALUES (?, ?, "ready")`,
            [web_userCode, vr_userCode], function (error, data) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, data);
                }
            });
    }else if(device==='web'){
        db.query(`INSERT INTO room (web_user, web_state, vr_user) VALUES (?, "ready", ?)`,
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
        db.query(`UPDATE room SET vr_state = ? WHERE web_user = ? AND vr_user = ? `, ["ready", web_userCode, vr_userCode], function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    } else {
        db.query(`UPDATE room SET web_state = ? WHERE web_user = ? AND vr_user = ?`, ["ready", web_userCode, vr_userCode], function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }
}

// 게임 room 삭제
exports.deleteRoom = function (web_userCode, vr_userCode, callback){
    db.query(`DELETE FROM room WHERE web_user = ? AND vr_user = ?`, [web_userCode, vr_userCode], function (error, results, fields) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}

exports.createRank = function (room_num, cleartime, vr_userCode, web_userCode, callback){
    db.query(`INSERT INTO game_rank (room_num, game_clear_time, vr_user, web_user) VALUES (?, ?, ?, ?)`, [room_num, cleartime, vr_userCode, web_userCode], function (error, results){
        if(error){
            callback(error, null);
        } else{
            callback(null, results);
        }
    });
}

exports.getRank = function (callback){
    db.query(`SELECT r.room_num, 
    CONCAT(
            LPAD(FLOOR((r.game_clear_time / 60000) % 60), 2, '0'), ':', -- 분
            LPAD(FLOOR((r.game_clear_time / 1000) % 60), 2, '0'), '.', -- 초
            LPAD(r.game_clear_time % 1000, 3, '0') -- 밀리초
        ) AS formatted_game_clear_time, 
     mVR.mem_profile AS vr_profile,
     mVR.mem_nickname AS vr_nickname,
     mWeb.mem_profile AS web_profile,
     mWeb.mem_nickname AS web_nickname FROM prisonvreak.game_rank AS r
     INNER JOIN prisonvreak.member AS mVR ON r.vr_user = mVR.mem_code
     INNER JOIN prisonvreak.member AS mWeb ON r.web_user = mWeb.mem_code
     ORDER BY game_clear_time;`,function(error, results){
        if(error){
            callback(error, null);
        } else{
            callback(null, results);
        }
    });
}

exports.vrGetRank = function (callback){
    db.query(`SELECT r.room_num, 
    CONCAT(
            LPAD(FLOOR((r.game_clear_time / 60000) % 60), 2, '0'), ':', -- 분
            LPAD(FLOOR((r.game_clear_time / 1000) % 60), 2, '0'), '.', -- 초
            LPAD(r.game_clear_time % 1000, 3, '0') -- 밀리초
        ) AS formatted_game_clear_time, 
     mVR.mem_nickname AS vr_nickname,
     mWeb.mem_nickname AS web_nickname 
     FROM prisonvreak.game_rank AS r
     INNER JOIN prisonvreak.member AS mVR ON r.vr_user = mVR.mem_code
     INNER JOIN prisonvreak.member AS mWeb ON r.web_user = mWeb.mem_code
     ORDER BY game_clear_time;`,function(error, results){
        if(error){
            callback(error, null);
        } else{
            callback(null, results);
        }
    });
}