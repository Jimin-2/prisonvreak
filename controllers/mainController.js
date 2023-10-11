const userModel = require("../models/userModel");
const gameModel = require("../models/gameModel");
const {noticeController} = require("./postController");
const moment = require("moment");

exports.gamepage = function (req, res) {
    const isLogined = req.session.is_logined;
    if (!isLogined) { // 로그인 X
        // alert 메시지 이후, 이전 페이지 돌아가기
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }
    res.render('game');
};

// web 게임 room 생성 or 참가
exports.webCreateOrJoinRoom = function (req, res){
    const web_userCode = req.session.user_code;
    let vr_userCode = req.body.connectionId;
    const device = 'web'

    if(web_userCode===vr_userCode){
        res.send('<script>alert("유저코드 같습니다."); location.href="/";</script>');
    }
    else {
        userModel.checkUsercodeAvailability(vr_userCode, (error, results) => {
            if (error) throw error;
            console.log(results.length);
            if (results.length <= 0) {
                res.send('<script>alert("존재하지 않는 유저코드입니다."); location.href="/";</script>');
            }
            else {
                gameModel.checkRoom(web_userCode, vr_userCode, (error, results) => {
                    if (error) throw ('error');
                    // 방이 없으면 생성
                    if (results.length <= 0) {
                        gameModel.createRoom(web_userCode, vr_userCode, device, (error, results) => {
                            if (error) throw ('error');
                        });
                    }
                    // 방이 있으면 참가
                    else if (results[0].web_user === web_userCode && results[0].web_state !== 'ready' && results[0].vr_user === vr_userCode) {
                        gameModel.joinRoom(web_userCode, vr_userCode, device, (error, results) => {
                            if (error) throw ('error');
                        });
                    } else {
                        res.send('<script>alert("방 정보가 올바르지 않습니다."); location.href="/auth/login";</script>');
                    }
                });
            }
        });
    }
};

// vr 게임 room 생성 or 참가
exports.vrCreateOrJoinRoom = function (req, res){
    const web_userCode = req.body.web_userCode;
    let vr_userCode = req.body.vr_userCode;
    const device = 'vr'
    if(web_userCode===vr_userCode){
        res.send('유저코드가 같습니다.');
    }
    else {
        userModel.checkUsercodeAvailability(web_userCode, (error, results) => {
            if (error) throw error;
            if (results.length <= 0) {
                res.send("존재하지 않는 유저코드입니다.");
            } else {
                gameModel.checkRoom(web_userCode, vr_userCode, (error, results) => {
                    if (error) throw ('error');
                    // 방이 없으면 생성
                    if (results.length <= 0) {
                        gameModel.createRoom(web_userCode, vr_userCode, device, (error, results) => {
                            if (error) throw ('error');
                            res.send('유저코드 유효성 검사 완료');
                        });
                    }
                    // 방이 있으면 참가
                    else if (results[0].web_user === web_userCode
                        && results[0].vr_state !== 'ready'
                        && results[0].vr_user === vr_userCode) {
                        gameModel.joinRoom(web_userCode, vr_userCode, device, (error, results) => {
                            if (error) throw ('error');
                            res.send('유저코드 유효성 검사 완료');
                        });
                    }
                    // 방이 이미 생성 된 상태
                    else if (results[0].web_user === web_userCode
                        && results[0].vr_state === 'ready'
                        && results[0].vr_user === vr_userCode) {
                        res.send('유저코드 유효성 검사 완료');
                    } else if (results[0].web_user === web_userCode
                        && results[0].vr_state === 'ready'
                        && results[0].web_state === 'ready'
                        && results[0].vr_user === vr_userCode) {
                        res.send("방 정보가 올바르지 않습니다.");
                    } else {
                        res.status(404).send();
                    }
                });
            }
        });
    }
};

// 게임 룸 삭제
exports.deleteRoom = function (req, res) {
    const web_userCode = req.session.user_code;
    let vr_userCode = req.body.connectionId;
    gameModel.deleteRoom(web_userCode, vr_userCode, (error, results) => {
        if(error)  throw ('error');
        res.status(200).send();
    })
};

// 게임 룸 체크
exports.checkMatching = function (req, res) {
    const web_userCode = req.body.user_code;
    let vr_userCode = req.body.connectionId;
    gameModel.checkRoom(web_userCode, vr_userCode, (error, results) => {
        if(error)  throw ('error');
        if(results[0].web_state === 'ready' && results[0].vr_state === 'ready'){
            res.send('매칭 성공');
        }else{
            res.send('매칭 실패');
        }
    })
};

// 랭크 생성
exports.createRank = function (req, res){
  let room_num;
  const cleartime = req.body.cleartime;
  const vr_userCode = req.body.vr_userCode;
  const web_userCode = req.body.web_userCode;
  gameModel.checkRoom(web_userCode,vr_userCode,(error,results)=>{
      if(error)  throw ('error');
      if(results[0].web_state === 'ready' && results[0].vr_state === 'ready'){
          room_num = results[0].room_num;
          gameModel.createRank(room_num,cleartime,vr_nickname,web_nickname, (error, results)=>{
              if(error)  throw ('error');
              gameModel.deleteRoom(web_userCode, vr_userCode, (error, results) => {
                  if (error) throw ('error');
              });
              res.send('등록 완료');
          });
      }
      else if(results[0].web_state !== 'ready' || results[0].vr_state !== 'ready'){
          res.send('정상적인 방이 아닙니다');
      }
  });
};

exports.rankpage = function (req, res){
    gameModel.getRank((error, data)=>{
        if (error) throw ('error');

        const paginatedResults = data.slice(0, 20);

        res.render('rank', {
            data: paginatedResults,
        });
    });
}
exports.manual = function (req, res) {
    res.render('manual');
};