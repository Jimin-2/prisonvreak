const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers/adminController');

router.get('/adminPage', adminController.adminPage);
router.get('/adminPage/users', adminController.adminUsers);
router.post('/adminPage/deleteUser', adminController.deleteUsers);
module.exports = router;