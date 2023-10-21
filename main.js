const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
//const FileStore = require('session-file-store')(session);
const passport = require('./config/passport');

const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const imageRouter = require('./routes/img');
const mainRouter = require('./routes/main');
const msgRouter = require('./routes/message');
const connectionRouter = require('./routes/connection');
const { friendModel } = require('./models/connectionModel');

const app = express();
const port = 8080;

//app.engine('html', require('ejs').renderFile); // 'html'을 뷰 엔진으로 설정
app.set('view engine', 'ejs');

app.set("views", './views');
app.use(express.static(`public`));


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

app.use(session({
    secret: 'aaaa@aaaa', // 원하는 문자 입력
    resave: false,
    saveUninitialized: true,
    //store: new FileStore({ path: './sessions' }),
}));

// is_logined 값 초기화
app.use((req, res, next) => {
    if (!req.session.is_logined) {
        req.session.is_logined = false; // 초기값은 로그인되지 않은 상태
    }
    res.locals.is_logined = req.session.is_logined;
    res.locals.nickname = req.session.nickname;
    next();
});

// Passport 및 세션 미들웨어 초기화
app.use(passport.initialize());
app.use(passport.session());


/*app.get('/', (req, res) => {
    if (!authCheck.isOwner(req, res)) {
        res.redirect('/auth/login');
        return false;
    } else {
        res.redirect('/main');
        return false;
    }
});*/

app.use((req, res, next) => {
    if (req.session.is_logined) {
        const mem_code = req.session.user_code;
        friendModel.pendingList(mem_code, (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result && 'user1Array' in result) {
            res.locals.newAlarm = true;
          } else {
            res.locals.newAlarm = false;
          }
          next();
        });
      } else {
        res.locals.newAlarm = false;
        next();
      }
});

// 인증 라우터
app.use('/auth', authRouter);
app.use('/img',imageRouter);
app.use('/', postRouter); // 게시판
app.use('/', mainRouter);
app.use('/msg', msgRouter);
app.use('/', connectionRouter); // 알림 및 친구기능

// 메인 페이지
/*app.get('/main', (req, res) => {
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
});*/
app.use('/module', express.static('src'));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
