const fs = require('fs');
const ejs = require('ejs');
const moment = require('moment');
const postModel = require('../models/postModel');

const postController = {
    showList: (req, res) => {
      fs.readFile('views/post.html', 'utf8', (error, data) => {
        postModel.getPosts((error, results) => {
          res.send(ejs.render(data, { data: results }));
        });
      });
    },

    showForm: (req, res) => {
        fs.readFile('views/postShow.html', 'utf8', (error, data) => {
            if (error) {
              console.error(error);
              res.status(500).send('Internal Server Error');
            } else {
              const postNum = req.params.post_num;
              postModel.getPostById(postNum, (error, result) => {
                if (error) {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                } else {
                  res.send(ejs.render(data, { data: result }));
                }
              });
            }
          });
    },
}

module.exports = postController;