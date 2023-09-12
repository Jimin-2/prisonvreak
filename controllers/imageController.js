const aws = require('aws-sdk');
const dotenv = require('dotenv');
const userModel = require('../models/userModel');
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

    if (!multerFile || !imageURL) {
        res.status(400).json({
            success: false,
        });
        return;
    }


    userModel.updateProfile(userId, imageURL, function (error, results) {
        if (error) {
            console.error('Error updating profile image:', error);
            res.status(500).json({
                success: false,
                error: error,
            });
        } else {
            // Send a response with the alert message
            const responseHTML = `
                <script type="text/javascript">
                    alert('수정되었습니다. 프로필 업데이트에는 약 1분이 소요됩니다^^');
                    opener.parent.location.reload();
                    window.close();
                </script>
            `;
            res.send(responseHTML);
        }
    });

};


exports.deleteProfileImage = (req, res) => {
    const userId = req.session.user_id; // 세션에서 사용자 아이디를 가져옵니다.
    const userImageKey = `profile/${userId}.jpg`; // S3 이미지 키를 구성합니다.

    // 1. 이미지가 기본 이미지인 경우 처리
    if (userImageKey === 'profile/default.jpg') {
        return res.status(400).json({ error: '기본 프로필 이미지는 삭제할 수 없습니다.' });
    }

    // 2. S3에서 이미지 삭제
    const deleteParams = {
        Bucket: BUCKET_NAME, // S3 버킷 이름
        Key: userImageKey, // 삭제할 이미지의 키
    };

    s3.deleteObject(deleteParams, async (err, data) => {
        if (err) {
            console.error('S3 이미지 삭제 오류:', err);
            res.status(500).json({ error: '프로필 이미지 삭제 중 오류가 발생했습니다.' });
        } else {
            console.log('S3 이미지 삭제 완료');
            const defaultProfileImageUrl = 'https://prisonvreak.s3.ap-northeast-2.amazonaws.com/profile/default-profile.jpg'; // S3 기본 이미지 URL
            userModel.deleteProfile(userId, defaultProfileImageUrl, function (error, results) {
                if (error) {
                    console.error('데이터베이스 업데이트 오류:', error);
                    res.status(500).json({ error: '데이터베이스 업데이트 중 오류가 발생했습니다.' });
                } else {
                    console.log('데이터베이스 업데이트 완료');
                    res.status(200).json({ message: '프로필 이미지가 삭제되었습니다.' });
                }
            });
        }
    });
};