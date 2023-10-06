const express = require('express');
const router = express.Router();
const mainController = require("../controllers/mainController");

router.get('/game',mainController.gamepage);

router.post('/webCreateOrJoinRoom', mainController.webCreateOrJoinRoom);

router.post('/deleteRoom', mainController.deleteRoom);

module.exports = router;
