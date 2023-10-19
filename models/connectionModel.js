const db = require('../config/db');
const friendModel = {
    getFriends: (mem_code, callback) => {
        db.query('SELECT * FROM friendships WHERE user1_mem_code = ? OR user2_mem_code = ?', [mem_code, mem_code], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                const userMemCodes = [];
                for (let i = 0; i < results.length; i++) {
                    // 사용자의 위치에 따라 user1_mem_code 또는 user2_mem_code를 가져옴
                    if (results[i].user1_mem_code === mem_code) {
                        userMemCodes.push(results[i].user2_mem_code);
                    } else {
                        userMemCodes.push(results[i].user1_mem_code);
                    }
                }
                // member 테이블에서 닉네임
                const memNicksQuery = 'SELECT mem_code, mem_nickname, mem_profile FROM member WHERE mem_code IN (?)';
                db.query(memNicksQuery, [userMemCodes], (error, memResults) => {
                    if (error) {
                        callback(null, null);
                    } else {
                        // 'mem_nickname' 값을 'user_mem_code'와 연결
                        const nicknameMap = {};
                        const profileMap = {};
                
                        memResults.forEach((mem) => {
                            nicknameMap[mem.mem_code] = mem.mem_nickname;
                            profileMap[mem.mem_code] = mem.mem_profile;
                        });
                
                        // results 객체에 'mem_nickname' 및 'mem_profile' 추가
                        for (let i = 0; i < results.length; i++) {
                            const userMemCode = userMemCodes[i];
                            // 사용자의 위치에 따라 user1_mem_code 또는 user2_mem_code를 설정
                            if (results[i].user1_mem_code === mem_code) {
                                results[i].user2_mem_code = userMemCode;
                            } else {
                                results[i].user1_mem_code = userMemCode;
                            }
                            results[i].mem_nickname = nicknameMap[userMemCode];
                            results[i].mem_profile = profileMap[userMemCode];
                        }
                
                        console.log(results);
                        callback(null, results);
                    }
                });
            }
        });
    },

    checkFriendship: (user1, user2, callback) => {
        if (user1 === undefined) { // 로그인이 되어있지 않을 때,
            callback(null, false);
            return;
        }

        const query = 'SELECT * FROM friendships WHERE (user1_mem_code = ? AND user2_mem_code = ?) OR (user1_mem_code = ? AND user2_mem_code = ?)';
        db.query(query, [user1, user2, user2, user1], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                if (user1 == user2) {
                    callback(null, true);
                }
                if (results.length > 0) {
                    const friendship = results[0];
                    if (friendship.status === 'accepted') {
                        console.log("오, 친구!");
                        callback(null, true);
                    } else if (friendship.status === 'pending') {
                        console.log("~친구 신청 중!~");
                        callback(null, 'pending');
                    } else {
                        console.log("친구 아님!");
                        callback(null, false);
                    }
                } else {
                    callback(null, false);
                }
            }
        });

    },

    // 친구 요청
    sendFriendRequest: (user1, user2, callback) => {
        const query = 'INSERT INTO friendships (user1_mem_code, user2_mem_code, status) VALUES (?, ?, ?)';
        const values = [user1, user2, 'pending'];

        db.query(query, values, (error, results) => {
            if (error) {
                console.error('친구 신청을 처리하는 중에 문제가 발생했습니다:', error);
                callback(error, false);
            } else {
                console.log('친구 신청이 성공적으로 생성되었습니다.');
                console.log(results);
                callback(null, true);
            }
        });
    },

    pendingList: (mem_code, callback) => {
        db.query('SELECT * FROM friendships WHERE (user1_mem_code = ? OR user2_mem_code = ?) AND status = ?', [mem_code, mem_code, 'pending'], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                const user1Array = [];
                const user2Array = [];

                for (let i = 0; i < results.length; i++) {
                    // 사용자의 위치에 따라 결과를 분리
                    if (results[i].user1_mem_code === mem_code) {
                        user1Array.push(results[i]);
                    } else {
                        user2Array.push(results[i]);
                    }
                }

                // member 테이블에서 닉네임
                const user1_mem_codes = user1Array.map(result => result.user2_mem_code);
                const user2_mem_codes = user2Array.map(result => result.user1_mem_code);

                const memNicksQuery = 'SELECT mem_code, mem_nickname FROM member WHERE mem_code IN (?)';
                db.query(memNicksQuery, [user1_mem_codes.concat(user2_mem_codes)], (err, memResults) => {
                    if (err) {
                        callback(null, null);
                    } else {
                        // 'mem_nickname' 값을 'user_mem_code'와 연결
                        const nicknameMap = {};
                        memResults.forEach((mem) => {
                            nicknameMap[mem.mem_code] = mem.mem_nickname;
                        });

                        // results 객체에 'mem_nickname' 추가
                        user1Array.forEach((result) => {
                            result.user1_mem_code = mem_code;
                            result.user2_mem_code = result.user2_mem_code;
                            result.mem_nickname = nicknameMap[result.user2_mem_code];
                        });

                        user2Array.forEach((result) => {
                            result.user1_mem_code = result.user1_mem_code;
                            result.user2_mem_code = mem_code;
                            result.mem_nickname = nicknameMap[result.user1_mem_code];
                        });

                        callback(null, { user1Array: user1Array, user2Array: user2Array });
                    }
                });
            }
        });
    },

    acceptedFriend: (friend_code, login_code, callback) => {
        const updateQuery = 'UPDATE friendships SET status = ? WHERE (user1_mem_code = ? AND user2_mem_code = ?)';
        const updateValues = ['accepted', friend_code, login_code];

        db.query(updateQuery, updateValues, (error, results) => {
            if (error) {
                console.error('친구 요청 수락 중 에러 발생:', error);
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    rejectFriend: (mem1_code, mem2_code, callback) => {
        const rejectQuery = 'DELETE FROM friendships WHERE (user1_mem_code = ? AND user2_mem_code = ?)';
        const rejectValues = [mem1_code, mem2_code];

        db.query(rejectQuery, rejectValues, (error, results) => {
            if (error) {
                console.error('친구 요청 거부 중 에러 발생:', error);
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    deleteFriend: (friend_code, login_code, callback) => {
        const deleteQuery = 'DELETE FROM friendships WHERE ((user1_mem_code = ? AND user2_mem_code = ?) OR (user1_mem_code = ? AND user2_mem_code = ?)) AND status = ?';
        const deleteValues = [friend_code, login_code, login_code, friend_code, 'accepted'];
        db.query(deleteQuery, deleteValues, (error, results) => {
            if (error) {
                console.error('친구 삭제 중 에러 발생:', error);
                callback(error, false);
            } else {
                console.log('친구 삭제 완료');
                callback(null, true);
            }
        });
    },
    
    fwithdrawal: (mem_code, callback) => {
        db.query('DELETE FROM friendships WHERE user1_mem_code = ? OR user2_mem_code = ?', [mem_code, mem_code], (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }
        });
      },

};

const alarmModel = {

};
module.exports = { friendModel, alarmModel };