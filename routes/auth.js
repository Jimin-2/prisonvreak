const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bodyParser = require('body-parser');

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

// 이메일 인증 코드 전송
router.post('/send_verification_email', authController.send_verification_email);

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

module.exports = router;
