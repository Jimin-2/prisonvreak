const db = require('../config/db');


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