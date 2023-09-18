const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bodyParser = require('body-parser');
const authCheckMiddleware = require('../middleware/authCheck');

router.use(bodyParser.json());

// 카카오 로그인 요청
router.get('/kakao', authController.kakao_login);

// 카카오 로그인 콜백 처리
router.get('/kakao/callback', authController.kakao_callback);

// 구글 로그인 요청
router.get('/google', authController.google_login);

// 구글 로그인 콜백 처리
router.get('/google/callback', authController.google_callback);

// 로그인 화면
router.get('/login', authController.login);

// 로그인 프로세스
router.post('/login_process', authController.login_process);

// 로그아웃
router.get('/logout', authController.logout);

// 회원가입 화면
router.get('/signup', authController.register);

// 소셜 회원가입 화면
router.get('/signupsocial', authController.socialregister);

// 아이디 중복 확인
router.post('/check_id_availability', authController.check_id_availability);

// 닉네임 중복 확인
router.post('/check_nickname_availability', authController.check_nickname_availability);

// 이메일 중복 확인
router.post('/check_email_availability', authController.check_email_availability);

// 이메일 인증 코드 전송
router.post('/send_verification_email', authController.sendVerificationEmail);

// 비밀번호 변경 시 이메일 인증 코드 전송
router.post('/password_verification_email', authController.passwordVerificationEmail);

// 인증 코드 확인
router.post('/verify_code', authController.verify_code);

// 회원가입 프로세스
router.post('/register_process', authController.register_process);

// 회원가입 프로세스
router.post('/socialregister_process', authController.socialregister_process);

// 고객지원 화면
router.get('/customer',authController.customer);

// 고객지원 프로세스
router.post('/customer_send',authController.customer_send);

//아이디 찾기 화면
router.get('/findID',authController.findID);

//아이디 찾기 프로세스
router.post('/find_id',authController.find_id);

//비밀번호 찾기 화면
router.get('/findPW',authController.findPW);

//비밀번호 찾기 프로세스
router.post('/find_pw',authController.find_pw);

//임시 비밀번호 발급 프로세스
router.post('/sendTemporaryPassword', authController.sendTemporaryPassword);

router.get('/mypage', authController.mypage);

router.get('/myProfileInfo',authController.myProfileInfo);

router.post('/editMyProfile', authController.editMyProfile);

router.post('/editMyInfo', authController.editMyInfo);

router.post('/editMyPassword', authController.editMyPassword);

router.post('/withdrawal', authController.withdrawal);

router.post('/socialWithdrawal', authController.socialWithdrawal);

router.post('/updateProfileIntro', authController.updateProfileIntro);

router.get('/myPost', authController.myPost);

router.get('/userProfile/:username', authController.userProfile);

module.exports = router;
