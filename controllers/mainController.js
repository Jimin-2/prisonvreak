const path = require('path');

exports.gamepage = function (req, res) {
    const isLogined = req.session.is_logined;
    if (!isLogined) { // 로그인 X
        // alert 메시지 이후, 이전 페이지 돌아가기
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }
    res.render('game')
};

