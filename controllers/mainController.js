const path = require('path');
const userModel = require("../models/userModel");

exports.gamepage = function (req, res) {
    const isLogined = req.session.is_logined;
    if (!isLogined) { // 로그인 X
        // alert 메시지 이후, 이전 페이지 돌아가기
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }
    res.render('game')
};

// web 게임 room 생성 or 참가
exports.webCreateOrJoinRoom = function (req, res){
    const web_userCode = req.session.user_code;
    let vr_userCode = req.body.connectionId;
    const device = 'web'

    userModel.checkUsercodeAvailability(vr_userCode, (error, results) =>{
        if(error) throw error;
        console.log(results.length);
        if(results.length <= 0){
            res.send('<script>alert("존재하지 않는 유저코드입니다."); location.href="/";</script>');
        }
        else{
            userModel.checkRoom(web_userCode, vr_userCode,(error, results)=>{
                if(error) throw ('error');

                // 방이 없으면 생성
                if(results.length <= 0) {
                    userModel.createRoom(web_userCode, vr_userCode, device, (error, results) =>{
                        if(error) throw ('error');
                    });
                }
                // 방이 있으면 참가
                else if(results[0].web_user === web_userCode && results[0].web_state !== 'ready' && results[0].vr_user === vr_userCode){
                    userModel.joinRoom(web_userCode, vr_userCode, device, (error,results) =>{
                        if(error) throw ('error');
                    });
                }
                else{
                    res.send('<script>alert("방 정보가 올바르지 않습니다."); location.href="/auth/login";</script>');
                }
            });
        }
    });
};

// vr 게임 room 생성 or 참가
exports.vrCreateOrJoinRoom = function (req, res){
    const web_userCode = req.session.user_code;
    let vr_userCode = req.body.connectionId;
    const device = 'vr'

    userModel.checkUsercodeAvailability(web_userCode, (error, results) =>{
        if(error) throw error;

        if(results.length <= 0){
            res.send("존재하지 않는 유저코드입니다.");
        }
        else{
            userModel.checkRoom(web_userCode, vr_userCode,(error, results)=>{
                if(error) throw ('error');

                // 방이 없으면 생성
                if(results.length <= 0) {
                    userModel.createRoom(web_userCode, vr_userCode, device, (error, results) =>{
                        if(error) throw ('error');
                    });
                }
                // 방이 있으면 참가
                else if(results[0].web_user === web_userCode && results[0].vr_state !== 'ready' && results[0].vr_user === vr_userCode){
                    userModel.joinRoom(web_userCode, vr_userCode, device, (error,results) =>{
                        if(error) throw ('error');
                    });
                }
                else{
                    res.send("방 정보가 올바르지 않습니다.");
                }
            });
        }
    });
};

// 게임 룸 삭제
exports.deleteRoom = function (req, res) {
    const web_userCode = req.session.user_code;
    let vr_userCode = req.body.connectionId;

    userModel.deleteRoom(web_userCode, vr_userCode, (error, results) => {
        if(error)  throw ('error');

    })
}

