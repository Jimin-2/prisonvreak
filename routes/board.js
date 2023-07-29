const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

// 라우트 수행
router.get('/board', boardController.showList);
router.get('/board/delete/:post_num', boardController.deletePost);
router.get('/board/insert', boardController.showInsertForm);
router.post('/board/insert', boardController.insertPost);
router.get('/board/edit/:post_num', boardController.showEditForm);
router.post('/board/edit/:post_num', boardController.updatePost);

module.exports = router;
