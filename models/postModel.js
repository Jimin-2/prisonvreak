const db = require('../config/db');

const postModel = {
    getPosts: (callback) => {
        db.query('SELECT * FROM post', (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    },

    getPostById: (postNum, callback) => {
        db.query('SELECT * FROM post WHERE post_num = ?', [postNum], (error, result) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, result[0]);
            }
        });
    },
}

module.exports = postModel;