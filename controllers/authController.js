const userModel = require('../models/userModel');
const passport = require('../config/passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path'); // 예를 들어, path 모듈을 사용하려면 이와 같이 정의할 수 있습니다.


// 회원가입 프로세스
exports.register_process = function (req, res) {
    const name = req.body.name;
    const nickname = req.body.nickname;
    const id = req.body.id;
    const password = req.body.pwd;
    const phone = req.body.phone;
    const email = req.body.email;
    const kakaoUserId = req.body.kakaoUserId; // 카카오톡 로그인 시 저장한 카카오 아이디
    const googleUserId = req.body.googleUserId; // 구글 로그인 시 저장한 구글 아이디

    // 구현 내용...
    if (name && nickname && id && password && phone && email) {
        // 회원가입하기 전에 인증 번호를 확인
        // 생성된 인증 번호와 입력된 인증 번호를 비교하여 유효성을 확인해야 함

        if (kakaoUserId) {
            // 카카오톡으로 가입한 경우, kakao_id 값을 저장
           userModel.registerUserWithKakao(name, nickname, id, password, phone, email, kakaoUserId, function (error, data) {
                    if (error) throw error;
                    // 회원가입 완료 후 카카오 아이디 세션 제거
                    delete req.session.kakaoUserId;
                    res.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                document.location.href="/";</script>`);
                });
        }
        else if (googleUserId) {
            // 구글로 가입한 경우, google_id 값을 저장
            userModel.registerUserWithGoogle(name, nickname, id, password, phone, email, googleUserId, function (error, data) {
                    if (error) throw error;
                    // 회원가입 완료 후 구글 아이디 세션 제거
                    delete req.session.googleUserId;
                    res.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                document.location.href="/";</script>`);
                });
        }
        else {
            // 일반 가입인 경우, kakao_id 값을 null로 저장
            userModel.registerUserLocal(name, nickname, id, password, phone, email, function (error, data) {
                    if (error) throw error;
                    res.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                document.location.href="/";</script>`);
                });
        }
    } else {
        res.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다.");
        history.back();</script>`);
    }
};

// 로그인 프로세스
exports.login_process = function (req, res) {
    const id = req.body.id;
    const password = req.body.pwd;

    if (id && password) {             // id와 pw가 입력되었는지 확인
        userModel.loginProcess(id, password, function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                req.session.is_logined = true;      // 세션 정보 갱신
                req.session.nickname = id;
                req.session.save(function () {
                    res.redirect(`/`);
                });
            } else {
                res.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/auth/login";</script>`);
            }
        });

    } else {
        res.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/auth/login";</script>`);
    }

};

// 로그아웃
exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
};

// 카카오 로그인 요청
exports.kakao_login = passport.authenticate('kakao');

// 카카오 로그인 콜백 처리
exports.kakao_callback = passport.authenticate('kakao', { failureRedirect: '/auth/login' }),
    function (req, res) {
        var kakaoUserId = req.user.id;
        console.log('카카오톡 아이디:', kakaoUserId);

        userModel.getUserByKakaoId(kakaoUserId, function (error, results) {
            if (error) throw error;

            if (results.length > 0) {
                // 이미 회원가입이 되어 있는 경우 로그인 처리
                req.session.is_logined = true;
                req.session.nickname = kakaoUserId;
                req.session.save(function () {
                    res.redirect('/');
                });
            } else {
                // 회원가입이 되어 있지 않은 경우 회원가입 페이지로 이동
                res.redirect('/auth/register?kakaoUserId=' + kakaoUserId);
            }
        });
    };

// 구글 로그인 요청
exports.google_login = passport.authenticate('google', { scope: ['profile', 'email'] });

// 구글 로그인 콜백 처리
exports.google_callback = passport.authenticate('google', { failureRedirect: '/auth/login' }),
    function (req, res) {
        var googleUserId = req.user.id;
        console.log('구글 아이디:', googleUserId);

        userModel.getUserByGoogleId(googleUserId, function (error, results) {
            if (error) throw error;

            if (results.length > 0) {
                // 이미 회원가입이 되어 있는 경우 로그인 처리
                req.session.is_logined = true;
                req.session.nickname = googleUserId;
                req.session.save(function () {
                    res.redirect('/');
                });
            } else {
                // 회원가입이 되어 있지 않은 경우 회원가입 페이지로 이동
                res.redirect('/auth/register?googleUserId=' + googleUserId);
            }
        });
    };

// 회원가입 화면
exports.register = function (req, res) {
    var title = '회원가입';
    var kakaoUserId = req.query.kakaoUserId; // URL 매개변수로 전달받은 kakaoUserId
    var googleUserId = req.query.googleUserId; // URL 매개변수로 전달받은 googleUserId
    var hiddenInput = '';

    // 카카오톡으로 로그인한 경우에는 kakaoUserId를 input hidden으로 추가
    if (kakaoUserId) {
        hiddenInput = '<input type="hidden" name="kakaoUserId" value="' + kakaoUserId + '">';
    }
    // 구글로 로그인한 경우에는 googleUserId를 input hidden으로 추가
    else if (googleUserId) {
        hiddenInput = '<input type="hidden" name="googleUserId" value="' + googleUserId + '">';
    }

    // register.html 파일을 읽어서 렌더링
    res.render(path.join(__dirname, '../views/signup.html'), {
        title: title,
        hiddenInput: hiddenInput
    });
};

// 로그인 화면
exports.login = function (req, res) {
    var title = '로그인';
    res.render(path.join(__dirname, '../views/login.html'), {
        title: title
        //html: html
    });
};

// 아이디 중복 확인
exports.check_id_availability = function (req, res) {
    const id = req.body.id;
    console.log('아이디 사용 가능 여부 확인:', id);

    userModel.checkIdAvailability(id,function (error,results) {
        if (error) throw error;

        var availability = {
            available: results.length === 0
        };

        console.log('아이디 사용 가능 여부:', availability.available);
        res.json(availability);
    });
};

// 이메일 인증 코드 전송
exports.send_verification_email = function (req, res) {
    const email = req.body.email;

    // 구현 내용...
};

// 인증 코드 확인
exports.verify_code = function (req, res) {
    const enteredCode = req.body.code;
    const storedCode = req.session.verificationCode;

    // 구현 내용...
};

// 인증 코드 생성 함수
function generateVerificationCode() {
    var code = '';
    for (var i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
};

// 사용자가 인증되었는지 확인하는 미들웨어
exports.authCheck = function (req, res, next) {
    if (req.isAuthenticated()) {
        // 사용자가 인증되었습니다. 다음 미들웨어나 라우트 핸들러로 진행합니다.
        return next();
    } else {
        // 사용자가 인증되지 않았으므로 로그인 페이지로 리디렉션합니다.
        res.redirect('/auth/login');
    }
};