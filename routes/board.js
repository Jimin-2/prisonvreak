const express = require('express');
const router = express.Router();
const { boardController, postController} = require('../controllers/boardController');

// 라우트 수행
router.get('/board', boardController.showList);
router.get('/board/delete/:post_num', boardController.deletePost);
router.get('/board/insert', boardController.showInsertForm);
router.post('/board/insert', boardController.insertPost);
router.get('/board/edit/:post_num', boardController.showEditForm); // 편집 폼
router.post('/board/edit/:post_num', boardController.updatePost);
router.get('/post', postController.showList);
router.get('/post/show/:post_num', postController.showForm);

module.exports = router;
