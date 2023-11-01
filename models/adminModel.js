const db = require('../config/db');

const adminModel = {
    adminUsers: (callback) => {
        const query = 'SELECT * FROM member';
        db.query(query, (error, results) => {
            if(error) {
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
};

module.exports = { adminModel };