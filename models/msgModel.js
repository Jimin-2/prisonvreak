const db = require('../config/db');

// msgModel.js
/*exports.chatroomList = function(user1_id, callback) {
    // user1_id가 속한 채팅방 목록을 가져오는 쿼리
    db.query(
        'SELECT Chatrooms.chatroom_id, member.mem_nickname, member.mem_profile ' +
        'FROM Chatrooms ' +
        'INNER JOIN Users ON (Chatrooms.user1_id = Users.id OR Chatrooms.user2_id = Users.id) ' +
        'WHERE Chatrooms.user1_id = ? OR Chatrooms.user2_id = ?',
        [user1_id, user1_id],
        function(error, results) {
            if (error) {
                callback(error, null);
            } else {
                // 각 채팅방 정보에 대해 상대방의 프로필 정보를 가져오는 쿼리
                for (const chatroom of results) {
                    db.query(
                        'SELECT mem_profile FROM Users WHERE mem_nickname = ?',
                        [chatroom.nickname],
                        function(innerError, profileResults) {
                            if (innerError) {
                                callback(innerError, null);
                            } else {
                                // 상대방의 프로필 정보를 채팅방 정보에 추가
                                chatroom.mem_profile = profileResults[0].mem_profile;
                            }
                        }
                    );
                }

                // 모든 정보가 추가된 결과를 반환
                callback(null, results);
            }
        }
    );
};*/
exports.chatroomList = function(user1_id, callback) {
    // user1_id가 속한 채팅방 목록을 가져오는 쿼리
    db.query(
        'SELECT Chatrooms.chatroom_id, member.mem_nickname AS receiverName, member.mem_profile AS receiverProfile ' +
        'FROM Chatrooms ' +
        'INNER JOIN member ON (Chatrooms.user1_id = member.mem_nickname OR Chatrooms.user2_id = member.mem_nickname) ' +
        'WHERE (Chatrooms.user1_id = ? OR Chatrooms.user2_id = ?) AND (member.mem_nickname <> ?)',
        [user1_id, user1_id, user1_id],
        function(error, results) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        }
    );
};

// 사용자1과 사용자2를 기반으로 채팅방을 생성하거나 반환
exports.chatroom = function(user1_id, user2_id, callback) {
    // 먼저 사용자1과 사용자2가 이미 있는 채팅방을 찾습니다.
    db.query(
        'SELECT chatroom_id FROM Chatrooms WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
        [user1_id, user2_id, user2_id, user1_id],
        function(error, results) {
            if (error) {
                callback(error, null);
            } else {
                if (results.length > 0) {
                    // 이미 채팅방이 있는 경우 채팅방 ID를 반환
                    callback(null, results[0].chatroom_id);
                } else {
                    // 채팅방이 없는 경우 새로운 채팅방을 생성하고 ID를 반환
                    db.query(
                        'INSERT INTO Chatrooms (user1_id, user2_id) VALUES (?, ?)',
                        [user1_id, user2_id],
                        function(error, insertResult) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null, insertResult.insertId);
                            }
                        }
                    );
                }
            }
        }
    );
};

exports.send_message = function(chatroomId, senderId, receiverId, messageContent, callback) {
    // Chatroom_Messages 테이블에 메시지를 삽입
    db.query(
        'INSERT INTO Chatroom_Messages (chatroom_id, sender_id, receiver_id, message_content) VALUES (?, ?, ?, ?)',
        [chatroomId, senderId, receiverId, messageContent],
        function(error, result) {
            if (error) {
                callback(error, null);
            } else {
                // 메시지 전송이 성공하면 결과를 반환
                callback(null, result);
            }
        }
    );
};

// 채팅방 내역을 불러오는 컨트롤러
exports.loadChatHistory = function (chatroomId, callback) {
    // 채팅방 내역을 불러오는 쿼리
    const query = `
        SELECT * 
        FROM Chatroom_Messages 
        WHERE chatroom_id = ? 
        ORDER BY sent_at ASC
    `;
    db.query(query, [chatroomId], function (error, results) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
};

exports.updateReadStatus=function (chatroomId, user1_id, callback) {
    const query = 'UPDATE Chatroom_Messages SET is_read = 1 WHERE chatroom_id = ? AND receiver_id = ? AND is_read = 0';
    db.query(query, [chatroomId, user1_id], (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}