const { adminModel } = require('../models/adminModel');
const { friendModel } = require('../models/connectionModel');
const moment = require('moment');

const adminController = {
    adminPage: (req, res) => {
        res.render('adminPage',);
    },

    adminUsers: (req, res) => {
        adminModel.adminUsers((err, users) => {
            users.forEach(user => {
                user.mem_created_at = moment(user.mem_created_at).format('YY.MM.DD HH:mm:ss');
                if (user.mem_updated_at !== null) {
                    user.mem_updated_at = moment(user.mem_updated_at).format('YY.MM.DD HH:mm:ss');
                }
            });
            res.render('admin_users', { users: users });
        })
    },

    deleteUsers: (req, res) => {
        const user_code = req.body.user_code;
        friendModel.fwithdrawal(user_code, () => { });
        adminModel.deleteUsers(user_code, (err, result) => {
            if (err) {
                res.status(500).json({ data: result, message: '사용자 삭제 오류' });
            } else {
                res.status(200).json({ data: result, message: '사용자 삭제 성공' });
            }
        })
    },

    reportRequests: (req, res) => {
        adminModel.reportRequests((err, reports) => {
            reports.forEach(report => {
                report.date_reported = moment(report.date_reported).format('YY.MM.DD HH:mm:ss');
            });
            res.render('admin_reportRequests', { reports: reports });
        })
    },

    reports: (req, res) => {
        adminModel.reports((err, reports) => {
            reports.forEach(report => {
                report.date_reported = moment(report.date_reported).format('YY.MM.DD HH:mm:ss');
            });
            res.render('admin_reports', { reports: reports });
        })
    },

    deleteReport: (req, res) => {
        const report_id = req.body.report_id;
        adminModel.deleteReport(report_id, (err, result) => {
            if (err) {
                res.status(500).json({ data: result, message: '신고 삭제 오류' });
            } else {
                res.status(200).json({ data: result, message: '신고 삭제 성공' });
            }
        })
    },

    reportCompleted: (req, res) => {
        const report_id = req.params.report_id;
        const reportText = req.body.reportText;
        adminModel.reportCompleted(reportText, report_id, (err, result) => {
            res.redirect('/adminPage/reportRequests');
        })
    },

    notice: (req, res) => {
        adminModel.notice((err, results) => {
            results.forEach(result => {
                result.post_created_at = moment(result.post_created_at).format('YY.MM.DD');
            });
            res.render('admin_notice', { results: results });
        });
    },

    community: (req, res) => {
        adminModel.community((err, results) => {
            results.forEach(result => {
                result.post_created_at = moment(result.post_created_at).format('YY.MM.DD');
            });
            res.render('admin_community', { results: results });
        });
    },
};

module.exports = { adminController };