module.exports = {
    isOwner: function (req, res) {
        if (req.session.is_logined) {
            return true;
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
            res.send(`<script type="text/javascript">alert("로그인 후 사용 가능합니다.");
      document.location.href="/auth/login";</script>`);
        }
    },
};

