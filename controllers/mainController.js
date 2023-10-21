const userModel = require("../models/userModel");
const gameModel = require("../models/gameModel");
const {noticeController} = require("./postController");
const moment = require("moment");

exports.indexpage = function (req,res){
    const isLogined = req.session.is_logined;
    if(isLogined){
        const username = req.session.nickname;
        userModel.getUserProfileByUsername(username, (error, results) => {
            if (error) {
                res.render('error'); // 에러 화면 렌더링 또는 다른 처리
            } else {
                const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장
                res.render('index', { userProfile: userProfile });
            }
        });
    }
    else res.render('index');
}

exports.gamepage = function (req, res) {
    const isLogined = req.session.is_logined;
    if (!isLogined) { // 로그인 X
        // alert 메시지 이후, 이전 페이지 돌아가기
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }

    const connectionId = req.body.partnerCode;
    console.log(connectionId);
    res.render('game', {connectionId: connectionId});
};

// web 게임 room 생성 or 참가
exports.webCreateOrJoinRoom = function (req, res){
    const web_userCode = req.session.user_code;
    let vr_userCode = req.body.connectionId;
    const device = 'web'

    if(web_userCode===vr_userCode){
        res.send('본인의 유저코드를 사용할수 없습니다.');
    }
    else {
        userModel.checkUsercodeAvailability(vr_userCode, (error, results) => {
            if (error) throw error;
            if (results.length <= 0) {
                res.send('존재하지 않는 유저코드입니다.');
            }
            else {
                gameModel.checkRoom(web_userCode, vr_userCode, (error, results) => {
                    if (error) throw ('error');
                    // 방이 없으면 생성
                    if (results.length <= 0) {
                        gameModel.createRoom(web_userCode, vr_userCode, device, (error, results) => {
                            if (error) throw ('error');
                            res.send('생성');
                        });
                    }
                    // 방이 있으면 참가
                    else if (results[0].web_user === web_userCode && results[0].web_state !== 'ready' && results[0].vr_user === vr_userCode) {
                        gameModel.joinRoom(web_userCode, vr_userCode, device, (error, results) => {
                            if (error) throw ('error');
                            res.send('참가');
                        });
                    } else {
                        res.send('방 정보가 올바르지 않습니다.');
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

    const web_userCode = req.body.web_userCode;
    let vr_userCode = req.body.vr_userCode;
    console.log(web_userCode);
    console.log(vr_userCode);

    gameModel.checkRoom(web_userCode, vr_userCode, (error, results) => {
        if(error)  throw ('error');
        console.log(results[0]);
        if(results[0].web_state === 'ready' && results[0].vr_state === 'ready'){
            console.log('성공');
            res.send('매칭 성공');
        }else{
            console.log('실패');
            res.send('매칭 실패');
        }
    })
};

// 랭크 생성
exports.createRank = function (req, res){
  const cleartime = req.body.cleartime;
  const vr_userCode = req.body.vr_userCode;
  const web_userCode = req.body.web_userCode;
  gameModel.checkRoom(web_userCode,vr_userCode,(error,results)=>{
      if(error)  throw ('error');
      if(results[0].web_state === 'ready' && results[0].vr_state === 'ready'){
          gameModel.createRank(cleartime,vr_userCode,web_userCode, (error, results)=>{
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

        const totalPosts = data.length;
        const totalPages = Math.ceil(totalPosts / 10);
        const currentPage = req.query.page ? parseInt(req.query.page) : 1;
        const { prevPage, startPage, endPage, nextPage } = noticeController.calculatePagination(currentPage, totalPages);

        let startIndex, endIndex;
        if (currentPage === totalPages) {
            startIndex = (totalPages - 1) * 10;
            endIndex = totalPosts;
        } else {
            startIndex = (currentPage - 1) * 10;
            endIndex = Math.min(startIndex + 10, totalPosts);
        }
        const paginatedResults = data.slice(startIndex, endIndex);
        res.render('rank', {
            data: paginatedResults,
            totalPages: totalPages,
            currentPage: currentPage,
            keyword: null,
            prevPage,
            startPage,
            endPage,
            nextPage,
            data_length: data.length,
        });
    });
};

exports.manual = function (req, res) {
    res.render('manual');
};

exports.loading = function (req,res){
    const isLogined = req.session.is_logined;
    if (!isLogined) { // 로그인 X
        // alert 메시지 이후, 이전 페이지 돌아가기
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }

    const nickname = req.session.nickname;
    const userCode = req.session.user_code;
    res.render('loading', {userCode: userCode, nickname: nickname});
}

exports.vrGetAllRank = function (req, res){
    gameModel.vrGetRank((error, results)=>{
        if (error) throw ('error');

        res.json(results);
    })
}

exports.vrClearGetRank = function (req, res){
    const cleartime = req.body.clearTime;
    let data;
    gameModel.vrClearGetRank(cleartime, (error, result, result2)=>{
        if (error) throw ('error');


        data = result.reverse();
        const concatdata = data.concat(result2);
        res.json(concatdata);
    });
}