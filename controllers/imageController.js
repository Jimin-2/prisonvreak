const aws = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const s3AccessKey = require("../config/s3");
const fs = require("fs");
const BUCKET_NAME = process.env.BUCKET_NAME;
const { accessKeyId, secretAccessKey, region } = s3AccessKey;

aws.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

const s3 = new aws.S3();

exports.uploadImage = (req, res) => {
    const multerFile = req.file;
    const userId = req.session.user_id; // 세션에서 사용자 아이디 가져오기

    const imageURL = multerFile.location
    const imageName = multerFile.key
    const imageSize = multerFile.size
    if (!multerFile) {
        // 이미지 업로드에 실패한 경우
        res.status(400);
        res.json({
            success: false,
        });
        return;
    }

    // 이미지를 저장할 디렉토리 경로 설정 (프로필 아이디 형식)
    let directory = `profile`; // 프로필 디렉토리 형식을 사용자 아이디로 설정
    if (directory !== '') {
        directory += '/';
    }

    // 파일 이름을 사용자 아이디.jpg로 설정 (예: 12345.jpg)
    //const filename = `${userId}.jpg`; // userId에 사용자 고유의 값이 할당되어야 합니다.

    /*    const params = {
            Bucket: BUCKET_NAME, // BUCKET_NAME은 이전에 설정한 버킷 이름
            Key: `${directory}${filename}`, // 경로와 파일 이름 설정
            Body: multerFile.buffer, // 이미지 파일의 바이너리 데이터
            ContentType: 'image/jpeg', // 이미지의 Content-Type을 설정하세요 (이미지 종류에 따라 다름)
        };*/

    console.log('req.file.buffer:', req.file.buffer);

    if (imageURL) {
        /*res.status(200)
        res.json({
            success: true,
            imageName: imageName,
            imageSize: imageSize,
            imageURL: `https://${BUCKET_NAME}.s3.amazonaws.com/${imageName}`,
        });*/
        res.send(`<script type="text/javascript">
                        alert('수정되었습니다. 프로필 업데이트에는 약 1분이 소요됩니다^^');
                        opener.parent.location.reload();
                        window.close();</script>`);
    } else {
        res.status(400)
        res.json({
            success: false,
        })
    }

};

exports.deleteProfileImage = (req,res) => {
    const userId = req.session.user_id; // 사용자의 아이디
    const userImageKey =  `profile/${userId}.jpg`; // S3에 저장될 파일 이름
    const params = {
        Bucket:BUCKET_NAME, // S3 버킷 이름
        Key: userImageKey,
        Body: fs.createReadStream('public/img/profile_default.jpg'), // 로컬 이미지 파일 경로
        ACL: 'public-read', // 이미지를 공개로 설정합니다.
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('S3 업로드 오류:', err);
        } else {
            console.log('S3 업로드 성공:', data.Location);
            res.status(200).json({ message: '프로필 이미지가 삭제되었습니다.' });

        }
    });

};
/*
exports.deleteImage = (req, res) => {
    const { imageName } = req.body;
    const imageArray = imageName.split("/");
    const imageKey = imageArray[3];
    const params = {
        Bucket: BUCKET_NAME, // BUCKET_NAME은 이전에 설정한 버킷 이름
        Key: imageKey, // 삭제할 이미지의 키
    };

    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.error('Image delete error:', err);
            res.status(400).json({
                success: false,
                error: err,
            });
        } else {
            console.log('Image deleted:', imageKey);
            res.status(201).json({
                success: true,
                deleted: imageKey,
            });
        }
    });
};*/
