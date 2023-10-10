const express = require('express');
const router = express.Router();
const mainController = require("../controllers/mainController");

router.get('/game',mainController.gamepage);

router.get('/rank', mainController.rankpage);

router.post('/webCreateOrJoinRoom', mainController.webCreateOrJoinRoom);

router.post('/vrCreateOrJoinRoom', mainController.vrCreateOrJoinRoom);

router.post('/deleteRoom', mainController.deleteRoom);

router.post('/checkMatching', mainController.checkMatching);

router.post('/createRank', mainController.createRank);

router.get('/manual', mainController.manual)

module.exports = router;
