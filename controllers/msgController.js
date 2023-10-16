//require('dotenv').config();
const userModel = require('../models/userModel');
const { postModel, commentModel } = require('../models/postModel');
const passport = require('../config/passport');
const path = require('path'); // 예를 들어, path 모듈을 사용하려면 이와 같이 정의할 수 있습니다.
const nodemailer = require('nodemailer');
const authCheckMiddleware = require('../middleware/authCheck');
const moment = require("moment/moment");
const { boardController, noticeController } = require('../controllers/postController');
const fs = require('fs');
const ejs = require('ejs');
//const authController = require("controllers/authController");
const msgModel = require('../models/msgModel');

exports.message = function (req, res) {
    var title = '쪽지함';

    // 현재 로그인한 사용자의 ID를 얻어옵니다. 이 부분은 세션 또는 로그인 정보를 얻는 방법에 따라 다를 수 있습니다.
    const user1_id = req.session.nickname; // 예시: 세션에서 사용자 ID를 가져옴

    // msgModel.chatroomList 함수를 호출하여 채팅방 목록을 가져옵니다.
    msgModel.chatroomList(user1_id, function (error, chatroomList) {
        if (error) {
            // 오류 처리
            res.render('error', { error: '채팅방 목록을 가져오는 중 오류가 발생했습니다.' });
        } else {
            // 채팅방 목록과 함께 쪽지함 화면을 렌더링합니다.
            res.render('message', {
                title: title,
                chatroomList: chatroomList // 채팅방 목록을 템플릿에 전달
            });
        }
    });
};


// 채팅방 조회 및 읽음 상태 업데이트
exports.chat_room = function (req, res) {
    console.log(req.session, req.params);
    var title = '쪽지보내기';
    const user1_id = req.session.nickname; // 로그인한 사용자
    const user2_id = req.params.user2_id; // 프로필 조회한 상대방
    const nickname = req.params.user2_id;

    // msgModel.chatroom 함수를 호출하여 채팅방을 생성 또는 가져오고, 채팅방 ID를 얻습니다.
    msgModel.chatroom(user1_id, user2_id, function (error, chatroomId) {
        if (error) {
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            // 읽음 상태 업데이트 함수 호출
            msgModel.updateReadStatus(chatroomId, user1_id, function (error) {
                if (error) {
                    res.render('error'); // 에러 화면 렌더링 또는 다른 처리
                } else {
                    // 채팅방 ID(chatroomId)를 사용하여 sendMessage 뷰로 이동합니다.
                    // 먼저 채팅 이력을 가져와서 뷰에 전달합니다.
                    msgModel.loadChatHistory(chatroomId, function (error, chatHistory) {
                        if (error) {
                            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
                        } else {
                            userModel.getUserProfileByNickname(nickname,function (error,results){
                                if (error) {
                                    res.render('error');
                                } else {
                                    const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장
                                    res.render('sendMessage', {
                                        userProfile : userProfile,
                                        title: title,
                                        chatroomId: chatroomId,
                                        user2_id: user2_id,
                                        user1_id: user1_id,
                                        chatHistory: chatHistory // 채팅 이력을 뷰로 전달
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};
// 메세지 전송 처리
exports.sendMessage = function(req, res) {
    console.log(req.params, req.body, req.session)
    const chatroomId = req.params.chatroomId;
    const senderId = req.session.nickname; // 로그인한 사용자
    const receiverId = req.body.receiverid;
    const messageContent = req.body.message; // 클라이언트에서 전송한 메세지 내용

    // msgModel.sendMessage 함수를 호출하여 메세지를 저장합니다.
    msgModel.send_message(chatroomId, senderId, receiverId, messageContent, function(error, result) {
        if (error) {
            console.error('에러', error);
            res.status(500).send('메시지 전송 중 오류가 발생했습니다.');
        } else {
            // 메세지를 성공적으로 저장한 후, 클라이언트에게 JSON 응답을 보냅니다.
            //res.redirect('/msg/sendMessage/${chatroomId}');

            res.send(`<script>
              window.location.href = "/msg/sendMessage/${receiverId}";
            </script>`);
        }
    });
};


/*// 메세지 전송 처리
exports.sendMessage = function(req, res) {
    console.log(req.params, req.body, req.session)
    const chatroomId = req.params.chatroomId;
    const senderId = req.session.nickname; // 로그인한 사용자
    const receiverId = req.body.receiverid;
    const messageContent = req.body.message; // 클라이언트에서 전송한 메세지 내용

    // msgModel.sendMessage 함수를 호출하여 메세지를 저장합니다.
    msgModel.send_message(chatroomId, senderId, receiverId, messageContent, function(error, result) {
        if (error) {
            console.error('에러', error);
            res.status(500).send('메시지 전송 중 오류가 발생했습니다.');
        } else {
            // 메세지를 성공적으로 저장한 후, 현재 채팅방 페이지로 리로드(새로 고침)
            res.redirect(`/msg/sendMessage/${chatroomId}`);
        }
    });
};*/

// 채팅방 내역을 불러오는 컨트롤러
exports.loadChatHistory = function (req, res) {
    const chatroomId = req.params.chatroomId;

    // msgModel 모듈에서 loadChatHistory 함수를 호출하여 채팅 내역을 불러옵니다.
    msgModel.loadChatHistory(chatroomId, function (error, chatHistory) {
        if (error) {
            console.error('채팅 내역을 불러오는 중 오류 발생:', error);
            res.status(500).json({ error: '채팅 내역을 불러오는 중 오류가 발생했습니다.' });
        } else {
            // 채팅 내역을 클라이언트에게 응답으로 전송
            res.json(chatHistory);
        }
    });
};
