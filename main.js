const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const passport = require('passport');

const authController = require('./controllers/authController');
const mainRouter = require('./routes/auth');
const authCheck = require('./middleware/authCheck');
const boardRouter = require('./routes/board');

const app = express();
const port = 8080;

app.engine('html', require('ejs').renderFile); // 'html'을 뷰 엔진으로 설정
app.set('view engine', 'html');

app.set("views", "./src/views");
app.use(express.static(`public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'aaaa@aaaa', // 원하는 문자 입력
    resave: false,
    saveUninitialized: true,
    store: new FileStore({ path: './sessions' }),
}));

// Passport 및 세션 미들웨어 초기화
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if (!authCheck.isOwner(req, res)) {
        res.redirect('/auth/login');
        return false;
    } else {
        res.redirect('/main');
        return false;
    }
});

// 인증 라우터
app.use('/auth', mainRouter);
app.use('/', boardRouter); // 게시판

// 메인 페이지
app.get('/main', (req, res) => {
    if (!authCheck.isOwner(req, res)) {
        res.redirect('/auth/login');
        return false;
    }

    var html = `
        <hr>
        <h2>메인 페이지에 오신 것을 환영합니다</h2>
        <p>로그인에 성공하셨습니다.</p>
        ${authCheck.statusUI(req, res)}
    `;
    res.send(html);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
