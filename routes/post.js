const express = require('express');
const router = express.Router();
const { boardController, noticeController } = require('../controllers/postController');
const { postUpload } = require('../modules/multer');

// 라우트 수행
router.get('/community', boardController.showList);
router.get('/community/delete/:post_num', boardController.deletePost);
router.get('/community/insert', boardController.showInsertForm);
//router.post('/community/insert', boardController.insertPost);
router.post('/community/insert', postUpload.single('post_image'), boardController.insertPost);
router.get('/community/edit/:post_num', boardController.showEditForm); // 편집 폼
router.post('/community/edit/:post_num', boardController.updatePost);
router.get('/community/show/:post_num', boardController.showForm);
router.post('/community/show/:post_num', boardController.addComment); // 댓글 추가
router.post('/community/show/:post_num/delete/:cmt_num', boardController.deleteComment);
router.post('/community/show/:post_num/edit/:cmt_num', boardController.updateComment);
router.get('/notice', noticeController.showManagerPosts);
router.get('/notice/show/:post_num', noticeController.showForm);
router.get('/notice/search', noticeController.searchKeyword);
router.post('/post-like/:post_num', boardController.postLike);

module.exports = router;
