const { adminModel } = require('../models/adminModel');
const { friendModel } = require('../models/connectionModel');
const moment = require('moment');

const adminController = { 
    adminPage: (req, res ) => {
         res.render('adminPage', );
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
        friendModel.fwithdrawal(user_code, () => {});
        adminModel.deleteUsers(user_code, (err, result) => {
            if(err){
                res.status(500).json({ data: result, message: '사용자 삭제 오류' });
            } else {
                res.status(200).json({ data: result, message: '사용자 삭제 성공' });
            }
        })
    },
};

module.exports = { adminController };