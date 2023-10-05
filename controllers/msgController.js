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
    // register.html 파일을 읽어서 렌더링
    res.render('message'), {
        title: title
        //hiddenInput: hiddenInput
    };
};


exports.chat_room = function (req, res) {
    var title = '쪽지보내기';
    const user1_id = req.session.nickname; // 로그인한 사용자
    const user2_id = req.params.user2_id; // 프로필 조회한 상대방

    // msgModel.chatroom 함수를 호출하여 채팅방을 생성 또는 가져오고, 채팅방 ID를 얻습니다.
    msgModel.chatroom(user1_id, user2_id, function (error, chatroomId) {
        if (error) {
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            // 채팅방 ID(chatroomId)를 사용하여 sendMessage 뷰로 이동합니다.
            res.render('sendMessage', { title: title, chatroomId: chatroomId ,user2_id : user2_id,user1_id:user1_id});
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
            // 메세지를 성공적으로 저장한 후, 현재 채팅방 페이지로 리로드(새로 고침)
            res.redirect(`/sendMessage/${chatroomId}`);
        }
    });
};
