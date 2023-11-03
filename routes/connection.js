const express = require('express');
const router = express.Router();
const { friendController } = require('../controllers/connectionController');

router.get('/myPage/friendList', friendController.friendList);
router.post('/sendFriendRequest', friendController.sendFriendRequest);
router.get('/myPage/newAlarm', friendController.pendingList);
router.post('/acceptFriend', friendController.acceptedFriend);
router.post('/rejectFriend', friendController.rejectFriend);
router.post('/cancelFriend', friendController.cancelFriend);
router.post('/deleteFriend', friendController.deleteFriend);
router.get('/userSearch', friendController.userSearch);
module.exports = router;