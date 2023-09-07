require('dotenv').config();
const s3AccessKey = require("../config/s3");
const aws = require("aws-sdk");
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path'); 
const { v4: uuidv4 } = require('uuid');

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

const postUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'prisonvreak-2023', 
        acl: 'public-read', 
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function(req, file, cb) {
            
            const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`; // UUID를 사용하여 파일 이름 생성
            const userId = req.session.user_id;
            const fileNameWithUserId = `${userId}-${Date.now()}-${uniqueName}`; // 사용자 ID를 포함한 파일 이름 생성

            // userId가 admin일 경우 notice 폴더로, 그렇지 않으면 community 폴더로 저장
            const folder = userId === 'admin' ? 'notice' : 'community';

            cb(null, `${folder}/${fileNameWithUserId}`);
        }
    })
});

module.exports = { upload, postUpload }; // upload 객체를 내보내도록 수정