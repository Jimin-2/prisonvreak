require('dotenv').config();

const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
    // 사용자 객체에서 고유한 식별자를 세션에 저장합니다.
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // 세션으로부터 사용자 객체를 복원합니다.
    // 필요한 경우 데이터베이스 등에서 사용자 정보를 조회합니다.
    // 예시: User.findById(id, (err, user) => done(err, user));
    done(null, { id }); // 간단한 예시로 임시 객체를 사용합니다.
});

passport.use(
    new KakaoStrategy(
        {
            clientID: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
            callbackURL: process.env.KAKAO_CALLBACK_URL,
        },
        function (accessToken,refreshToken,profile,done){

            return done(null,profile);
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email']
        },
        function (accessToken,refreshToken,profile,done){

            return done(null,profile);
        }
    )
);

module.exports = passport;