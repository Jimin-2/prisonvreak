const fs = require('fs');
const ejs = require('ejs');
const moment = require('moment');
const postModel = require('../models/postModel');

// 컨트롤러 함수
const boardController = {
  showList: (req, res) => {
    postModel.getPosts((error, results) => {
      const formattedResults = results.map(post => ({
        ...post,
        formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
      }));
  
      res.render('board', { data: formattedResults });
    });
  },

  deletePost: (req, res) => {
    const postNum = req.params.post_num;
    postModel.deletePost(postNum, () => {
      res.redirect('/community');
    });
  },

  showInsertForm: (req, res) => {
    fs.readFile('views/boardInsert.html', 'utf8', (error, data) => {
      res.send(data);
    });
  },

  insertPost: (req, res) => {
    const body = req.body;
    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');
    postModel.insertPost(
      body.post_title,
      body.post_content,
      body.post_usernum,
      koreanTime,
      () => {
        res.redirect('/community');
      }
    );
  },

  showEditForm: (req, res) => {
    fs.readFile('views/boardEdit.html', 'utf8', (error, data) => {
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

  updatePost: (req, res) => {
    const body = req.body;
    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const postNum = req.params.post_num;
    postModel.updatePost(
      body.post_title,
      body.post_content,
      koreanTime,
      postNum,
      () => {
        res.redirect('/community');
      }
    );
  },
};

const noticeController = {
  showManagerPosts: (req, res) => {
    const userNum = 1;
  
    postModel.getPostsByUserNum(userNum, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        const formattedResults = results.map(post => ({
          ...post,
          formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
        }));
  
        res.render('notice', { data: formattedResults });
      }
    });
  },

  showForm: (req, res) => {
    fs.readFile('views/noticeShow.html', 'utf8', (error, data) => {
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
            postModel.incrementPostHit(postNum, (error) => { // 조회수 증가
              if (error) {
                console.error(error);
              } else {
              res.send(ejs.render(data, { data: result }));
              }
            });
          }
        });
      }
    });
  },

};

module.exports = { boardController, noticeController };
