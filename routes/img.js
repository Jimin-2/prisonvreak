const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { upload } = require('../modules/multer');

// 라우트 설정
router.post('/uploadImage', upload.single('image'), imageController.uploadImage);
router.delete('/deleteImage', imageController.deleteImage);

module.exports = router;
