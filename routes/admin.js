const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers/adminController');

router.get('/adminPage', adminController.adminPage);
router.get('/adminPage/users', adminController.adminUsers);
router.post('/adminPage/deleteUser', adminController.deleteUsers);
router.get('/adminPage/reportRequests', adminController.reportRequests);
router.get('/adminPage/reports', adminController.reports);
router.post('/adminPage/deleteReport', adminController.deleteReport);
router.post('/adminPage/reportCompleted/:report_id', adminController.reportCompleted);
router.get('/adminPage/notice', adminController.notice);
module.exports = router;