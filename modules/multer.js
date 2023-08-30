require('dotenv').config();
const s3AccessKey = require("../config/s3");
const aws = require("aws-sdk");
const multer = require('multer');
const multerS3 = require('multer-s3');

const { accessKeyId, secretAccessKey, region } = s3AccessKey;

aws.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'prisonvreak',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const userId = req.session.user_id; // 사용자 아이디 가져오기
            cb(null,`profile/${userId}.jpg`); // 원하는 형식으로 파일 이름 변경
        },
        /*buffer: function (req, file, cb) {
            // 이 부분에서 버퍼를 생성하도록 설정
            cb(null, file.buffer);
        },*/
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
})

module.exports = { upload }; // upload 객체를 내보내도록 수정