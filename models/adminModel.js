const db = require('../config/db');

const adminModel = {
    adminUsers: (callback) => {
        const query = 'SELECT * FROM member';
        db.query(query, (error, results) => {
            if (error) {
                console.log(error);
            }
            callback(null, results);
        })
    },

    deleteUsers: (user_code, callback) => {
        const query = 'DELETE FROM member WHERE mem_code = ?'
        db.query(query, user_code, (error, results) => {
            if (error) {
                callback(error, false);
            } else {
                callback(null, true);
            }
        })
    },

    reports: (callback) => {
        const query = `SELECT report.*, comment.cmt_usernum, comment.cmt_content, comment.post_num, process_description
        FROM report
        JOIN comment ON report.cmt_num = comment.cmt_num
        WHERE report.is_completed = 1;`;
        db.query(query, (error, results) => {
            if (error) {
                console.log(error);
            }
            callback(null, results);
        })
    },

    reportRequests: (callback) => {
        const query = `SELECT report.*, comment.cmt_usernum, comment.cmt_content, comment.post_num
        FROM report
        JOIN comment ON report.cmt_num = comment.cmt_num
        WHERE report.is_completed <> 1;`;
        db.query(query, (error, results) => {
            if (error) {
                console.log(error);
            }
            callback(null, results);
        })
    },

    deleteReport: (report_id, callback) => {
        const query = 'DELETE FROM report WHERE report_id = ?'
        db.query(query, report_id, (error, results) => {
            if (error) {
                callback(error, false);
            } else {
                callback(null, true);
            }
        })
    },

    reportCompleted: (reportText, report_id, callback) => {
        const query = 'UPDATE report SET process_description = ?, is_completed = 1 WHERE report_id = ?;'
        db.query(query, [reportText, report_id], (error, results) => {
            if (error) {
                callback(error, false);
            } else {
                callback(null, true);
            }
        })
    },

    notice: (callback) => {
        const query = 'SELECT * FROM post WHERE post_usernum = 1';
        db.query(query, (error, results) => {
            if (error) {
                console.log(error);
            }
            callback(null, results);
        });
    },

    community: (callback) => {
        const query = 'SELECT * FROM post WHERE post_usernum <> 1';
        db.query(query, (error, results) => {
            if (error) {
                console.log(error);
            }
            callback(null, results);
        });
    },
};

module.exports = { adminModel };