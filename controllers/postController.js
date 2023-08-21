const fs = require('fs');
const ejs = require('ejs');
const moment = require('moment');

const { postModel, commentModel } = require('../models/postModel');

// 컨트롤러 함수
const boardController = {
  

  showInsertForm: (req, res) => {
    // 로그인 확인
    const isLoggedIn = req.session.nickname !== undefined; // 세션 사용자 정보 확인
    if (!isLoggedIn) { // 로그인 X
      // alert 메시지 이후, 이전 페이지 돌아가기
      console.log(req.session.user)
      return res.send('<script>alert("로그인이 필요합니다."); history.back();</script>');
    }
    // 로그인시
    res.render('boardInsert');
    console.log(req.session);
  },

  showForm: (req, res) => {
    const postNum = req.params.post_num;

    postModel.getPostById(postNum, (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
      postModel.incrementPostHit(postNum, (error) => {
        if (error) {
          console.error(error);
        } else {
          commentModel.getComments(postNum, (commentError, comments) => {
            if (commentError) {
              console.error(commentError);
              res.status(500).send('Internal Server Error');
              return;
            }
         res.render('boardShow', { data: result, comments: comments });
          console.log(comments)
        });
      }
    });
  });
},

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


  insertPost: (req, res) => {
    const body = req.body;
    console.log(body);
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
        const postNum = req.params.post_num;
        postModel.getPostById(postNum, (error, result) => {
          if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          } else {
            res.render('boardEdit', { data: result });
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

  addComment: (req, res) => {
    const body = req.body;
    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const postNum = req.params.post_num;
    commentModel.insertComments(
      postNum,
      body.cmt_content,
      body.cmt_usernum,
      koreanTime,
      () => {
        console.log(postNum);
        res.send('<script>alert("댓글 등록 완료"); history.back();</script>');
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
              res.render('noticeShow', { data: result });
            }
          });
        }
      });
  },

};

module.exports = { boardController, noticeController };
