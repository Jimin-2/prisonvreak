require('dotenv').config();
const userModel = require('../models/userModel');
const { postModel, commentModel } = require('../models/postModel');
const passport = require('../config/passport');
const path = require('path'); // 예를 들어, path 모듈을 사용하려면 이와 같이 정의할 수 있습니다.
const nodemailer = require('nodemailer');
const authCheckMiddleware = require('../middleware/authCheck');
const moment = require("moment/moment");
const { boardController, noticeController } = require('../controllers/postController');

// 랜덤 유저코드 생성
function getRandom() {
    const max = 9999;
    const length = String(max).length;
    const number = Math.floor(Math.random() * max);
    return (Array(length).join('0') + number).slice(-length);
}

// 데이터베이스에서 해당 유저 코드가 이미 존재하는지 확인하는 함수
function checkIfUserCodeExists(usercode) {

    userModel.checkUsercodeAvailability(usercode, function (error, data){
        if(error) throw error;

        if(data.length > 0){
            return true;
        }
        else{
            return false;
        }
    });
}

// 회원가입 프로세스
exports.register_process = function (req, res) {
    const name = req.body.name;
    const nickname = req.body.nickname;
    const id = req.body.id;
    const password = req.body.pwd;
    const phone = req.body.phone;
    const email = req.body.email;
    let usercode = getRandom();
    if (name && nickname && id && password && phone && email) {
        while (checkIfUserCodeExists(usercode)){
            usercode = getRandom();
        }

        userModel.registerUserLocal(usercode, name, nickname, id, password, phone, email, function (error, data) {
            if (error) throw error;
            // 회원 가입이 성공한 후 사용자에게 알림을 표시합니다.
            res.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
            document.location.href="/";</script>`);
        });
    } else {
        res.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다.");
    history.back();</script>`);
    }
};

//소셜 회원가입
exports.socialregister_process = function (req, res) {
    const name = req.body.name;
    const nickname = req.body.nickname;
    const phone = req.body.phone;
    const pwd = req.body.pwd;
    const email = req.body.email;
    const kakaoUserId = req.body.kakaoUserId; // 카카오톡 로그인 시 저장한 카카오 아이디
    const googleUserId = req.body.googleUserId; // 구글 로그인 시 저장한 구글 아이디
    let usercode = getRandom();

    // 구현 내용...
    if (name && nickname && phone && email) {
        while (checkIfUserCodeExists(usercode)){
            usercode = getRandom();
        }
        if (kakaoUserId) {
            // 카카오톡으로 가입한 경우, kakao_id 값을 저장
            userModel.registerUserWithKakao(usercode, pwd, name, nickname, kakaoUserId, phone, email, function (error, data) {
                if (error) throw error;
                // 회원가입 완료 후 카카오 아이디 세션 제거
                delete req.session.kakaoUserId;
                res.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                document.location.href="/";</script>`);

            });
        }
        else if (googleUserId) {
            // 구글로 가입한 경우, google_id 값을 저장
            userModel.registerUserWithGoogle(usercode, pwd, name, nickname, googleUserId, phone, email, function (error, data) {
                if (error) throw error;
                // 회원가입 완료 후 구글 아이디 세션 제거
                delete req.session.googleUserId;
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
                req.session.nickname = results[0].mem_nickname;
                req.session.user_id = results[0].mem_id;
                req.session.provider = results[0].mem_provider;
                req.session.user_code = results[0].mem_code;
                req.session.save(function () {
                    // 로그인 성공 시 메인 페이지로 이동하고 환영 메시지를 alert로 띄우기
                    const authStatusUI = `${req.session.nickname}님 환영합니다!`;
                    res.send(`<script type="text/javascript">alert("${authStatusUI}");
                    location.href="/";</script>`);
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

// VR 로그인 프로세스
exports.vr_login_process = function (req, res) {
    const userCode = req.body.userCode;
    const password = req.body.pwd;

    if (userCode && password) {             // id와 pw가 입력되었는지 확인
        userModel.vrLoginProcess(userCode, password, function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                res.send('로그인 성공');
            } else {
                res.send('로그인 정보가 일치하지 않습니다.');
            }
        });
    } else {
        res.send('아이디와 비밀번호를 입력하세요.');
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
exports.kakao_callback = function (req, res, next) {
    passport.authenticate('kakao', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/auth/login'); }

        var kakaoUserId = user.id;
        var email = user._json.kakao_account.email;
        console.log('카카오톡 아이디:', kakaoUserId);
        console.log('카카오톡 이메일:', email);

        userModel.getUserByKakaoId(kakaoUserId, function (error, results) {
            if (error) throw error;

            if (results.length > 0) {
                // 이미 회원가입이 되어 있는 경우 로그인 처리
                req.session.is_logined = true;
                req.session.nickname = results[0].mem_nickname;
                req.session.user_id = results[0].mem_id;
                req.session.provider = results[0].mem_provider;
                const authStatusUI = `${req.session.nickname}님 환영합니다!`;
                res.send(`<script type="text/javascript">alert("${authStatusUI}");
                    document.location.href="/";</script>`);
                /*req.session.save(function () {
                    res.redirect('/');
                });*/
            } else {
                // 회원가입이 되어 있지 않은 경우 회원가입 페이지로 이동
                res.redirect('/auth/signupsocial?kakaoUserId=' + kakaoUserId +'&email='+ email);
            }
        });
    })(req, res, next);
};

// 구글 로그인 요청
exports.google_login = passport.authenticate('google', { scope: ['profile', 'email'] });

// 구글 로그인 콜백 처리
exports.google_callback = function (req, res, next) {
    passport.authenticate('google', function (err, profile, info) {
        if (err) { return next(err); }
        if (!profile) { return res.redirect('/auth/login'); }

        var googleUserId = profile.id;
        var email = profile.emails[0].value;;
        console.log('구글 아이디:', googleUserId);

        userModel.getUserByGoogleId(googleUserId, function (error, results) {
            if (error) throw error;

            if (results.length > 0) {
                // 이미 회원가입이 되어 있는 경우 로그인 처리
                req.session.is_logined = true;
                req.session.nickname = results[0].mem_nickname;
                req.session.user_id = results[0].mem_id;
                req.session.provider = results[0].mem_provider;
                const authStatusUI = `${req.session.nickname}님 환영합니다!`;
                res.send(`<script type="text/javascript">alert("${authStatusUI}");
                    document.location.href="/";</script>`);
                /*req.session.save(function () {
                    res.redirect('/');
                });*/
            } else {
                // 회원가입이 되어 있지 않은 경우 회원가입 페이지로 이동

                res.redirect('/auth/signupsocial?googleUserId=' + googleUserId +'&email='+ email);
            }
        });
    })(req, res, next);
};

// 회원가입 화면
exports.register = function (req, res) {
    var title = '회원가입';
    // register.html 파일을 읽어서 렌더링
    res.render('signup'), {
        title: title
        //hiddenInput: hiddenInput
    };
};

// 소셜 회원가입 화면
exports.socialregister = function (req, res) {
    var title = '회원가입';
    console.log(req.query)
    var kakaoUserId = req.query.kakaoUserId; // URL 매개변수로 전달받은 kakaoUserId
    var googleUserId = req.query.googleUserId; // URL 매개변수로 전달받은 googleUserId
    var email = req.query.email;
    var hiddenInput = '';
    var provider = '';

    // 카카오톡으로 로그인한 경우에는 kakaoUserId를 input hidden으로 추가
    if (kakaoUserId) {
        hiddenInput = kakaoUserId;
        provider = 'kakaoUserId';
    }
    // 구글로 로그인한 경우에는 googleUserId를 input hidden으로 추가
    else if (googleUserId) {
        hiddenInput = googleUserId;
        provider = 'googleUserId';
    }
    // register.html 파일을 읽어서 렌더링하며, 이름과 전화번호를 템플릿에 전달합니다.
    res.render('signupsocial', {
        title: title,
        hiddenInput: hiddenInput,
        provider : provider,
        email: email
    });
};
// 로그인 화면
exports.login = function (req, res) {
    var title = '로그인';
    res.render('login'), {
        title: title
        //html: html
    };
};

function isLogined (req, res) {
    const isLogined = req.session.is_logined;
    if (!isLogined) { // 로그인 X
        // alert 메시지 이후, 이전 페이지 돌아가기
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>');
    }
}

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

// 닉네임 중복 확인
exports.check_nickname_availability = function (req, res) {
    const nickname = req.body.nickname;
    console.log('닉네임 사용 가능 여부 확인:', nickname);

    userModel.checkNicknameAvailability(nickname,function (error,results) {
        if (error) throw error;

        var availability = {
            available: results.length === 0
        };

        console.log('닉네임 사용 가능 여부:', availability.available);
        res.json(availability);
    });
};

// 이메일 중복 확인
exports.check_email_availability = function (req, res) {
    const email = req.body.email;
    console.log('이메일 사용 가능 여부 확인:', email);

    userModel.checkEmailAvailability(email,function (error,results) {
        if (error) throw error;

        var availability = {
            available: results.length === 0
        };

        console.log('이메일 사용 가능 여부:', availability.available);
        res.json(availability);
    });
};

// 닉네임 보유자 확인
exports.check_nickname = function (req, res) {
    const nickname = req.body.nickname;
    const userId = req.session.user_id;
    console.log('닉네임 주인 확인:', nickname);

    userModel.checkNicknameAvailability(nickname,function (error,results) {
        if (error) throw error;

        var check = {
            available: results[0].mem_id === userId
        };

        console.log('닉네임 주인:', check.available);
        res.json(check);
    });
};

// 이메일 보유자 확인
exports.check_email = function (req, res) {
    const email = req.body.email;
    const userId = req.session.user_id;
    console.log('이메일 주인 확인:', email);

    userModel.checkEmailAvailability(email,function (error,results) {
        if (error) throw error;

        var check = {
            available: results[0].mem_id === userId
        };

        console.log('이메일 주인:', check.available);
        res.json(check);
    });
};

// 고객지원프로세스
exports.customer_send = function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const contents = req.body.contents;

    // 클라이언트에서 전송한 파일 정보
    const fileName = req.body.fileName; // 수정된 부분
    const fileData = req.body.fileData; // 파일 데이터 (Base64 형식)
    // 파일 데이터를 Buffer로 변환
    const fileBuffer = Buffer.from(fileData.split(',')[1], 'base64'); // 'data:image/jpeg;base64,' 이 부분 제거
    const maxFileSizeBytes = 25 * 1024 * 1024; // 25MB를 바이트로 변환

    if (fileBuffer.length > maxFileSizeBytes) {
        // 파일 크기가 제한을 초과한 경우
        return res.send('<script type="text/javascript">alert("첨부파일은 25MB 이하만 첨부가능합니다.");history.back();</script>');
    }


    // 이메일 발송 설정
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'prisonvreakcan@gmail.com',
            pass: process.env.EMAIL_PASS
        },
    });

    const mailOptions = {
        from: 'prisonvreakcan@gmail.com',
        to: 'prisonvreakcan@gmail.com',
        subject: '고객지원문의',
        text: `고객명: ${name}\n이메일: ${email}\n전화번호:${phone}\n문의내용: ${contents}`,
        attachments: [
            {
                filename: fileName,
                content: fileBuffer,
            }
        ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('이메일 전송 오류:', error);
            res.send('<script type="text/javascript">alert("파일의 크기가 너무 큽니다 (25MB이하만 첨부가능합니다!)");history.back();</script>');
        } else {
            console.log('이메일 전송 성공:', info.response);
            res.send('<script type="text/javascript">alert("이메일 발송이 완료되었습니다!");document.location.href="/auth/customer";</script>');
        }
    });
};


exports.customer = function (req, res) {
    isLogined(req, res);
    const userId = req.session.user_id;
    userModel.getUserProfile(userId, (error, results) => {
        if (error) {
            res.render('error');
        } else {
            const userProfile = results[0];
            res.render('customer', { userProfile: userProfile }); // customer.ejs로 userProfile 데이터 전달
        }
    });
};

// 비밀번호 변경 시 이메일 인증 코드 전송
exports.passwordVerificationEmail = function (req, res) {
    const email = req.body.email;

    // 이메일 일치 확인
    userModel.checkEmailAvailability(email, function (error, results) {
        if (error) {
            console.error('데이터베이스 오류:', error);
            res.status(500).send();
        } else {
            if (results.length > 0) {
                // 일치하는 이메일인 경우, 이메일 전송 로직 수행
                console.log('Sending verification email to:', email);

                // 무작위 인증 코드 생성 (6자리 숫자)
                var verificationCode = generateVerificationCode();

                // 이메일과 인증 코드를 세션에 저장
                req.session.verificationCode = verificationCode;

                // Nodemailer를 사용하여 이메일 전송
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'prisonvreakcan@gmail.com',
                        pass: process.env.EMAIL_PASS
                    }
                });

                var mailOptions = {
                    from: 'prisonvreakcan@gmail.com',
                    to: email,
                    subject: '이메일 인증 번호',
                    text: '인증 번호는 다음과 같습니다: ' + verificationCode
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error('이메일 전송 오류:', error);
                        res.status(500).send();
                    } else {
                        console.log('이메일 전송 성공:', info.response);
                        res.status(200).send();
                    }
                });
            } else {
                // 일치하지 않은 경우
                res.status(400).json({ message: '이메일이 일치하지 않습니다.' });
            }
        }
    });
};
// 인증 코드 생성 함수
function generateVerificationCode() {
    var code = '';
    for (var i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}
// 이메일 인증 코드 전송
exports.sendVerificationEmail = function (req, res) {
    const email = req.body.email;

    // 이메일 중복 확인
    userModel.checkEmailAvailability(email, function (error, results) {
        if (error) {
            console.error('데이터베이스 오류:', error);
            res.status(500).send();
        } else {
            if (results.length > 0) {
                // 중복된 이메일인 경우
                res.status(400).json({ message: '중복된 이메일입니다.' });
            } else {
                // 중복되지 않은 경우, 이메일 전송 로직 수행
                console.log('Sending verification email to:', email);

                // 무작위 인증 코드 생성 (6자리 숫자)
                var verificationCode = generateVerificationCode();

                // 이메일과 인증 코드를 세션에 저장
                req.session.verificationCode = verificationCode;

                // Nodemailer를 사용하여 이메일 전송
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'prisonvreakcan@gmail.com',
                        pass: process.env.EMAIL_PASS
                    }
                });

                var mailOptions = {
                    from: 'prisonvreakcan@gmail.com',
                    to: email,
                    subject: '이메일 인증 번호',
                    text: '인증 번호는 다음과 같습니다: ' + verificationCode
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error('이메일 전송 오류:', error);
                        res.status(500).send();
                    } else {
                        console.log('이메일 전송 성공:', info.response);
                        res.status(200).send();
                    }
                });
            }
        }
    });
};


// 인증 코드 확인
exports.verify_code = function (req, res) {
    const enteredCode = req.body.code;
    const storedCode = req.session.verificationCode;

    if (enteredCode === storedCode) {
        // 인증 성공
        res.json({ valid: true });
    } else {
        // 인증 실패
        res.json({ valid: false });
    }
    // 구현 내용...
};


//아이디 찾기 화면
exports.findID = function (req, res) {
    res.render('findID');
};

//아이디 찾기 프로세스
exports.find_id = function (req,res) {
    const name = req.body.name;
    const email = req.body.email;

    userModel.findUserId(name, email, (error, results) => {
        if (error) {
            throw error; // 에러가 발생하면 프로그램 중단
        } else {
            if (results.length > 0) {
                const foundId = results[0].mem_id;
                res.render('resultID', { id: foundId });
            } else {
                res.send(`
                    <script type="text/javascript">
                        alert("가입된 정보가 없습니다");
                        history.back();
                    </script>
                `);
            }
        }
    });

};

//비밀번호 찾기 화면
exports.findPW = function (req, res) {
    res.render('findPW');
};

//비밀번호 찾기 프로세스
exports.find_pw = function (req, res) {
    const id = req.body.id;
    const name = req.body.name;
    const email = req.body.email;

    userModel.findUserForPasswordReset(id, name, email, (error, results) => {
        if (error) {
            throw error;
        } else {
            if (results.length > 0) {
                // Generate a temporary password
                const temporaryPassword = generateTemporaryPassword();

                // Update the temporary password in the database
                userModel.updateTemporaryPassword(id, temporaryPassword, (updateError, updateResults) => {
                    if (updateError) {
                        throw updateError;
                    } else {
                        // Send the temporary password via email
                        exports.sendTemporaryPassword(email, temporaryPassword, (sendError, sendInfo) => {
                            if (sendError) {
                                res.send(`<script type="text/javascript">alert("이메일 전송 오류");history.back();</script>`);
                            } else {
                                res.send(`<script type="text/javascript">
                                          alert("임시 비밀번호가 발급되었습니다");
                                          document.location.href="/auth/login";</script>`);
                            }
                        });
                    }
                });
            } else {
                res.send(`<script type="text/javascript">alert("정보가 일치하지 않습니다");history.back();</script>`);
            }
        }
    });
};


exports.sendTemporaryPassword = function (email, temporaryPassword, callback) {
    console.log('Sending temporary password email to:', email);

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'prisonvreakcan@gmail.com',
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: 'prisonvreakcan@gmail.com',
        to: email,
        subject: '임시 비밀번호 발급',
        text: '임시 비밀번호는 다음과 같습니다: ' + temporaryPassword
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('이메일 전송 오류:', error);
            callback(error, null);
        } else {
            console.log('이메일 전송 성공:', info.response);
            callback(null, info);
        }
    });
};

// 무작위 임시 비밀번호 생성 함수
function generateTemporaryPassword() {
    let password = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;

    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return password;
}


// 마이페이지
exports.mypage = function (req, res) {
    isLogined(req, res);
    const nickname = req.session.nickname;// 로그인된 사용자의 아이디
    const postsPerPage = 5;
    const link = 'myPage';
    myPostList(req, res, nickname, postsPerPage, link);
};

// 작성한 게시글 페이지
exports.myPost = function (req, res) {
    isLogined(req, res);
    const nickname = req.session.nickname;// 로그인된 사용자의 아이디
    const postsPerPage = 15;
    const link = 'myPost';

    myPostList(req, res, nickname, postsPerPage, link);
};

// 작성한 게시글 가져오는 함수
myPostList = function (req, res, nickname, postsPerPage, link){
    // userModel을 사용하여 사용자의 프로필 정보 가져오기
    userModel.getUserProfileByUsername(nickname, (error, results) => {
        if (error) {
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장

            // 작성한 게시글 가져오는 부분
            postModel.getPostsByUserNum(userProfile.mem_code,(error, data)=>{
                if (error) {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                }
                const reversedResults = data.reverse();
                const totalPosts = reversedResults.length;
                const totalPages = Math.ceil(totalPosts / postsPerPage);
                const currentPage = req.query.page ? parseInt(req.query.page) : 1;
                const { prevPage, startPage, endPage, nextPage } = noticeController.calculatePagination(currentPage, totalPages);

                let startIndex, endIndex;
                if (currentPage === totalPages) {
                    endIndex = totalPosts;
                    startIndex = Math.max(endIndex - (totalPosts % postsPerPage), 0);
                } else {
                    startIndex = (currentPage - 1) * postsPerPage;
                    endIndex = startIndex + postsPerPage;
                }

                const paginatedResults = reversedResults.slice(startIndex, endIndex);
                const formattedResults = paginatedResults.map(post => ({
                    ...post,
                    formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
                }));

                res.render(link, {
                    userProfile: userProfile,
                    data: formattedResults,
                    totalPages: totalPages,
                    currentPage: currentPage,
                    keyword: null,
                    prevPage,
                    startPage,
                    endPage,
                    nextPage
                });
            });
        }
    });
}

// 개인 정보 수정 페이지
exports.myProfileInfo = function (req, res) {
    isLogined(req, res);
    const userId = req.session.user_id;// 로그인된 사용자의 아이디

    res.render('myProfileInfo', {user: req.session});
};

// 개인 정보 수정 창 들어갈때 비밀번호 확인
exports.editMyProfile = function (req, res) {
    isLogined(req, res);


    const id = req.body.id;
    const password = req.body.pwd;

    if (id && password) {             // id와 pw가 입력되었는지 확인
        userModel.getMyProfile(id, password, function(error, results) {
            if (error) throw error;
            if (results.length > 0) {
                const myProfile = results[0]; // 프로필 정보를 myProfile 변수로 저장
                res.render('editMyProfile', { myProfile: myProfile });
            } else {
                res.send(`<script type="text/javascript">alert("비밀번호가 일치하지 않습니다."); 
                history.back();</script>`);
            }
        });

    } else {
        res.send(`<script type="text/javascript">alert("비밀번호를 입력하세요!"); 
        history.back();</script>`);
    }
};

// 프로필 수정(닉네임, 전화번호, 이메일)
exports.editMyInfo = function (req, res) {
    isLogined(req, res);

    const id = req.body.id;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const phone = req.body.phone;

    userModel.getUserProfile(id, function (error, results){
        if (error) {
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장
            if(nickname==userProfile.mem_nickname && email == userProfile.mem_email && phone == userProfile.mem_phone){
                res.send(`<script type="text/javascript">
            alert('수정된 정보가 없습니다.');
            history.back();</script>`);
            } else{
                userModel.updateUserInfo(id,nickname,phone,email,function (error, data){
                    if (error) {
                        res.render('error'); // 에러 화면 렌더링 또는 다른 처리
                    } else {
                        res.send(`<script type="text/javascript">
                        alert('수정되었습니다.');
                        opener.parent.location.reload();
                        window.close();</script>`);
                    }
                });
            }
        }
    });
}

// 비밀번호 수정
exports.editMyPassword = function (req, res) {
    isLogined(req, res);

    const id = req.body.id;
    const password = req.body.pwd;

    if (id && password) {             // id와 pw가 입력되었는지 확인
        userModel.updateUserPassword(id, password, function (error, data) {
            if (error) throw error;
            res.send(`<script type="text/javascript">
            alert('비밀번호가 변경되었습니다!')
            opener.parent.location.reload();
            window.close();</script>`);
        });
    } else {
        res.send(`<script type="text/javascript">alert("비밀번호를 입력하세요!"); 
        history.back();</script>`);
    }
}

// 회원탈퇴
exports.withdrawal = function (req, res) {
    isLogined(req, res);

    const id = req.body.id;
    const password = req.body.pwd;

    if (id && password) {             // id와 pw가 입력되었는지 확인
        userModel.getMyProfile(id, password, function(error, results) {
            if (error) throw error;
            if (results.length > 0) {
                userModel.withdrawal(id, password, function (error, data) {
                    if (error) throw error;
                    req.session.is_logined = false;
                    res.send(`<script type="text/javascript">
                    opener.parent.location='/';
                    window.close();</script>`);
                });
            } else {
                res.send(`<script type="text/javascript">alert("비밀번호가 일치하지 않습니다."); 
                history.back();</script>`);
            }
        });
    } else {
        res.send(`<script type="text/javascript">alert("비밀번호를 입력하세요!"); 
        history.back();</script>`);
    }
}


// 한줄 소개 수정
exports.updateProfileIntro = function (req, res){
    isLogined(req, res);

    const id = req.session.user_id;
    const newIntro = req.body.memIntro;
    userModel.getUserProfile(id, function (error, results){
        if (error) {
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장
            if(newIntro==userProfile.mem_intro){
                res.send(`<script type="text/javascript">
            alert('수정된 내용이 없습니다.');
            history.back();</script>`);
            } else {
                userModel.updateProfileIntro(id, newIntro, function (error, data) {
                    if (error) throw error;
                    console.log(id, newIntro);
                    res.send(`<script type="text/javascript">alert("한 줄 소개가 수정되었습니다."); location.href="/auth/mypage";</script>`);
                });
            }}});
}

//유저프로필 조회
exports.userProfile = function (req, res) {
    console.log(req.params)
    const username = req.params.username;

    userModel.getUserProfileByUsername(username, (error, results) => {
        if (error) {
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장
            res.render('userProfile', { userProfile: userProfile });
        }
    });
};

// 프로필 조회
exports.profile = function (req, res) {
    console.log(req.params)
    console.log(req.body)
    const username = req.params.username;
    const postsPerPage = 5;
    console.log(username)
    // userModel을 사용하여 사용자의 프로필 정보 가져오기
    userModel.getUserProfileByUsername(username, (error, results) => {
        if (error) {
            //console.error(error);
            res.render('error'); // 에러 화면 렌더링 또는 다른 처리
        } else {
            //console.log('User Profile Results:', results);
            const userProfile = results[0]; // 프로필 정보를 userProfile 변수로 저장

            console.log(results);
            console.log(userProfile);


            // 작성한 게시글 가져오는 부분
            postModel.getPostsByUserNum(userProfile.mem_code,(error, data)=>{
                if (error) {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                }
                const reversedResults = data.reverse();

                const totalPosts = reversedResults.length;
                const totalPages = Math.ceil(totalPosts / postsPerPage);

                const currentPage = req.query.page ? parseInt(req.query.page) : 1;

                const { prevPage, startPage, endPage, nextPage } = noticeController.calculatePagination(currentPage, totalPages);

                let startIndex, endIndex;
                if (currentPage === totalPages) {
                    endIndex = totalPosts;
                    startIndex = Math.max(endIndex - (totalPosts % postsPerPage), 0);
                } else {
                    startIndex = (currentPage - 1) * postsPerPage;
                    endIndex = startIndex + postsPerPage;
                }

                const paginatedResults = reversedResults.slice(startIndex, endIndex);
                const formattedResults = paginatedResults.map(post => ({
                    ...post,
                    formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
                }));

                res.render('profile', {
                    userProfile: userProfile,
                    data: formattedResults,
                    totalPages: totalPages,
                    currentPage: currentPage,
                    keyword: null,
                    prevPage,
                    startPage,
                    endPage,
                    nextPage
                });
            });
        }
    });
};

