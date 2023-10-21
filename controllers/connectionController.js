const { friendModel, alarmModel } = require('../models/connectionModel');

const friendController = {
    friendList: (req, res, searchResults = []) => {
        const mem_code = req.session.user_code;
        friendModel.getFriends(mem_code, (err, result) => {
            if (err) {
                console.log(err)
            }
            res.render('friendList', { friendList: result, login_code: mem_code, search: searchResults, newAlarm: res.locals.newAlarm});
        });
    },

    userSearch: (req, res) => {
        const option = req.query.searchOption;
        const keyword = req.query.keyword;
        const login_code = req.session.user_code;

        friendModel.userSearch(option, keyword, (err, search) => {
            if (err) {
                console.error(err);
            } else {
                const filteredSearch = search.filter(item => (item.mem_code !== login_code) && (item.mem_code !== '1'));
                const memCodes = filteredSearch.map(item => item.mem_code);

                // 모든 mem_code에 대한 결과를 처리
                const promises = memCodes.map(mem_code => {
                    return friendModel.userFilter(login_code, mem_code);
                });

                Promise.all(promises)
                    .then(statuses => { // filterdSearch에 합치기
                        filteredSearch.forEach((item, index) => {
                            item.status = statuses[index];
                        });
                        
                        friendController.friendList(req, res, filteredSearch);
                    })
                    .catch(error => {
                        // 오류 처리
                        console.error(error);
                    });
            }
        });
    },


    sendFriendRequest: (req, res) => {
        const login_code = req.session.user_code;
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
        const mem_code = req.session.user_code;
        friendModel.pendingList(mem_code, (err, result) => {
            if (err) {
                console.log(err)
            }
            
            if (result && 'user1Array' in result) {
                res.locals.newAlarm = true;
            } else {
                res.locals.newAlarm = false;
            }
            console.log(res.locals.newAlarm);

            res.render('newAlarm', { pendingList: result, newAlarm: res.locals.newAlarm });
        });
    },

    acceptedFriend: (req, res) => {
        const friend_code = req.body.friend_code;
        const login_code = req.session.user_code;

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
        const friend_code = req.body.friend_code;
        const login_code = req.session.user_code;

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
        const friend_code = req.body.friend_code;
        const login_code = req.session.user_code;

        friendModel.rejectFriend(login_code, friend_code, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ data: result, message: '요청 취소 오류' });
            } else {
                console.log(result)
                res.status(200).json({ data: result, message: '친구 요청 취소' });
            }
        });
    },

    deleteFriend: (req, res) => {
        const friend_code = req.body.friend_code;
        const login_code = req.session.user_code;
        friendModel.deleteFriend(friend_code, login_code, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ data: result, message: '친구 삭제 오류' });
            } else {
                console.log(result)
                res.status(200).json({ data: result, message: '친구 삭제 성공' });
            }
        })
    },
};

const alarmController = {

};

module.exports = { friendController, alarmController };