const { friendModel, alarmModel } = require('../models/connectionModel');

const friendController = {
    friendList: (req, res) => {
        const mem_code = parseInt(req.session.user_code);
        friendModel.getFriends(mem_code, (err, result) => {
            if (err) {
                console.log(err)
            }
            res.render('friendList', { friendList: result, login_code: mem_code, });
        });
    },

    sendFriendRequest: (req, res) => {
        const login_code = req.body.login_code;
        const friend_code = req.body.friend_code;

        friendModel.sendFriendRequest(login_code, friend_code, (error, success) => {
            if (error) { // 에러 처리
                res.status(500).json({ success: false, message: '친구 신청을 처리하는 중에 문제가 발생했습니다.' });
            } else if (success) {
                res.status(200).json({ success: true, message: '친구 신청이 완료되었습니다.' });
            } else { // 예외
                res.status(500).json({ success: false, message: '친구 신청을 처리하는 중에 문제가 발생했습니다.' });
            }
        });
    },

    pendingList: (req, res) => {
        const mem_code = parseInt(req.session.user_code);
        friendModel.pendingList(mem_code, (err, result) => {
            if (err) {
                console.log(err)
            }
            console.log(result);
            res.render('newAlarm', { pendingList: result });
        });
    },

    acceptedFriend: (req, res) => {
        const friend_code = parseInt(req.body.friend_code);
        const login_code = parseInt(req.session.user_code);

        friendModel.acceptedFriend(friend_code, login_code, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ data: result, message: '친구 수락 오류' });
            } else {
                console.log(result)
                res.status(200).json({ data: result, message: '친구 요청 수락' });
            }
        });
    },

    rejectFriend: (req, res) => {
        const friend_code = parseInt(req.body.friend_code);
        const login_code = parseInt(req.session.user_code);

        friendModel.rejectFriend(friend_code, login_code, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ data: result, message: '친구 거부 오류' });
            } else {
                console.log(result)
                res.status(200).json({ data: result, message: '친구 요청 거부' });
            }
        });
    },

    cancelFriend: (req, res) => {
        const friend_code = parseInt(req.body.friend_code);
        const login_code = parseInt(req.session.user_code);

        friendModel.rejectFriend(login_code, friend_code, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ data: result, message: '요청 취소 오류' });
            } else {
                console.log(result)
                res.status(200).json({ data: result, message: '친구 요청 취소' });
            }
        });
    }

};

const alarmController = {

};

module.exports = { friendController, alarmController };