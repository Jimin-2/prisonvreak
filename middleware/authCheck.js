module.exports = {
    isOwner: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            return false;
        }
    },
    statusUI: function (req, res) {
        var authStatusUI = '로그인후 사용 가능합니다';
        if (this.isOwner(req, res)) {
            authStatusUI = `${req.session.nickname}님 환영합니다 | <a href="/auth/logout">로그아웃</a>`;
        }
        return authStatusUI;
    },
    redirectToLogin: function (req, res, next) {
        if (this.isOwner(req, res)) {
            return next();
        } else {
            // 인증되지 않은 사용자에게 알림을 띄우고 로그인 페이지로 리디렉션
            return res.send(`<script type="text/javascript">alert("로그인 후 사용 가능합니다.");
        document.location.href="/auth/login";</script>`);
            // return 키워드를 추가하여 res.send()가 실행된 후 함수를 종료합니다.
        }
    },
};


