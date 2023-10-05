const express = require('express');
const router = express.Router();
const msgController = require('../controllers/msgController');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

// 쪽지함
router.get('/message', msgController.message);

//채팅방 생성
router.get('/sendMessage/:user2_id', msgController.chat_room);

//쪽지 보내기
router.post('/sendMessage/:chatroomId', msgController.sendMessage);

module.exports = router;