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
      console.log(req.session.user);
      return res.send('<script>alert("로그인이 필요합니다."); history.back();</script>');
    }
    // 로그인시
    const userId = req.session.user_id;
    res.render('boardInsert', { userId: userId });
  },

  showForm: (req, res) => {
    const post_num = req.params.post_num;
  
    postModel.getPostById(post_num, (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
      postModel.incrementPostHit(post_num, (error) => {
        if (error) {
          console.error(error);
        } else {
          commentModel.getComments(post_num, (commentError, comments) => {
            if (commentError) {
              console.error(commentError);
              res.status(500).send('Internal Server Error');
              return;
            }
            postModel.getNicknameByPostId(post_num, (error, nickname, profile) => {
              if (error) {
                console.error(error);
              } else {
                console.log(nickname);
                res.render('boardShow', { data: result, comments: comments, nickname: nickname, profile: profile });
              }
            });
          });
        }
      });
    });
  },

      // 작성자의 닉네임 가져오기
  getNames: (req, res) => {
    const post_num = req.params.post_num;
    postModel.getNicknameByPostId(post_num, (error, nickname) => {
      if(error) {
        console.log(error);
      } else {
        console.log(nickname);
        res.render('boardShow', {nickname: nickname});
      }
    })
  },
  showList: (req, res) => {
    postModel.excludedUserNum(1, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
      const reversedResults = results.reverse();

      const postsPerPage = 10; // 한 페이지당 표시되는 게시물 수
      const totalPosts = reversedResults.length;
      const totalPages = Math.ceil(totalPosts / postsPerPage);

      const currentPage = req.query.page ? parseInt(req.query.page) : 1;

      const { prevPage, startPage, endPage, nextPage } = noticeController.calculatePagination(currentPage, totalPages);

      let startIndex, endIndex;
      if (currentPage === totalPages) {
        endIndex = totalPosts;
        startIndex = Math.max(endIndex - (totalPosts % postsPerPage), 0);
      } else {
        startIndex = (currentPage - 1) * postsPerPage;
        endIndex = startIndex + postsPerPage;
      }

      const paginatedResults = reversedResults.slice(startIndex, endIndex);

      const formattedResults = paginatedResults.map(post => ({
        ...post,
        formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
      }));

      res.render('board', {
        data: formattedResults,
        search: formattedResults, // 검색 결과를 전달
        totalPages: totalPages,
        currentPage: currentPage,
        prevPage,
        startPage,
        endPage,
        nextPage,
      });
    });
  },

  // showBoard: (req, res) => {
  //   noticeController.fetchAndRenderPosts(req, res, 'board', 20);
  // },

  deletePost: (req, res) => {
    const postNum = req.params.post_num;
    postModel.deletePost(postNum, () => {
      res.redirect('/community');
    });
  },


  insertPost: (req, res) => {
    const userId = req.session.user_id;
    const body = req.body;
    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const imageUrl = req.file ? req.file.location : null;
    postModel.getMemNumByMemId(userId, (error, memnum) => {
      postModel.insertPost(
        body.post_title,
        imageUrl,
        body.post_content,
        memnum,
        koreanTime,
        () => {
          res.redirect('/community');
        }
      );
    })
    },

  showEditForm: (req, res) => {
    const postNum = req.params.post_num;
    postModel.getPostById(postNum, (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('boardEdit', { data: result, user_id: userId });
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
    console.log(req.session.user_id);
    const isLoggedIn = req.session.user_id !== undefined;
    const mem_id = req.session.user_id;
    const body = req.body;
    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const post_num = req.body.post_num;
    const cmt_refnum = req.body.cmt_refnum || null;

    if (!isLoggedIn) {
      return res.send('<script>alert("로그인 후 댓글 등록이 가능합니다."); window.location.href = "/auth/login";</script>');
    }
    else {
      postModel.getMemNumByMemId(mem_id, (error, userNum) => {
        if (error) {
          console.error(error);
        } else {
          console.log(userNum);
          commentModel.insertComments(
            post_num,
            body.cmt_content,
            userNum,
            koreanTime,
            cmt_refnum,
            () => {
              res.send(`<script>
              var mem_id = "${mem_id}";
              alert("댓글 등록이 완료되었습니다.");
              window.location.href = "/community/show/${post_num}";
            </script>`);
            }
          );

        }
      });
    };
},

}

const noticeController = {
  calculatePagination: (currentPage, totalPages) => {
    const maxPagePerGroup = 5;
    const currentGroup = Math.ceil(currentPage / maxPagePerGroup);

    let prevPage = null;
    if (currentPage > 1) {
      const prevPageGroup = currentGroup - 1;
      prevPage = (prevPageGroup - 1) * maxPagePerGroup + 1;
    }

    const startPage = (currentGroup - 1) * maxPagePerGroup + 1;
    const endPage = Math.min(currentGroup * maxPagePerGroup, totalPages);

    let nextPage = null;
    if (endPage < totalPages) {
      const nextPageGroup = currentGroup + 1;
      nextPage = (nextPageGroup - 1) * maxPagePerGroup + 1;
    }

    return {
      prevPage,
      startPage,
      endPage,
      nextPage
    };
  },

  fetchAndRenderPosts: (req, res, pageName, postsPerPage, searchResults = []) => {
    const userNum = 1;
  
    // 검색 결과가 있을 때와 없을 때를 구분하여 검색 로직을 선택
    const getPostsFunction = searchResults.length > 0 ? postModel.searchKeyword : postModel.getPostsByUserNum;
    const params = searchResults.length > 0 ? [req.query.keyword] : [userNum];
  
    getPostsFunction(...params, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      const reversedResults = results.reverse();
  
      const totalPosts = reversedResults.length;
      const totalPages = Math.ceil(totalPosts / postsPerPage);
  
      const currentPage = req.query.page ? parseInt(req.query.page) : 1;
  
      const { prevPage, startPage, endPage, nextPage } = noticeController.calculatePagination(currentPage, totalPages);
  
      let startIndex, endIndex;
      if (currentPage === totalPages) {
        endIndex = totalPosts;
        startIndex = Math.max(endIndex - (totalPosts % postsPerPage), 0);
      } else {
        startIndex = (currentPage - 1) * postsPerPage;
        endIndex = startIndex + postsPerPage;
      }
  
      const paginatedResults = reversedResults.slice(startIndex, endIndex);
      const formattedResults = paginatedResults.map(post => ({
        ...post,
        formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
      }));
  
      res.render(pageName, {
        data: formattedResults,
        search: searchResults, // 검색 결과 전달
        totalPages: totalPages,
        currentPage: currentPage,
        keyword: null,
        prevPage,
        startPage,
        endPage,
        nextPage
      });
    });
  },
  

  showManagerPosts: (req, res) => {
    noticeController.fetchAndRenderPosts(req, res, 'notice', 5);
  },

  searchKeyword: (req, res) => {
    const keyword = req.query.keyword;
  
    if (!keyword) {
      res.send('<script>alert("검색어를 입력하세요"); history.back();</script>');
      return;
    }
  
    postModel.searchKeyword(keyword, 1, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      if (results.length === 0) {
        res.send('<script>alert("검색결과가 없습니다."); history.back();</script>');
        return;
      }
  
      console.log(keyword);
      const reversedResults = results.reverse();
  
      const postsPerPage = 5; // 한 페이지당 표시되는 게시물 수
      const totalPosts = reversedResults.length;
      const totalPages = Math.ceil(totalPosts / postsPerPage);
  
      const currentPage = req.query.page ? parseInt(req.query.page) : 1;
  
      const { prevPage, startPage, endPage, nextPage } = noticeController.calculatePagination(currentPage, totalPages);
  
      let startIndex, endIndex;
      if (currentPage === totalPages) {
        endIndex = totalPosts;
        startIndex = Math.max(endIndex - (totalPosts % postsPerPage), 0);
      } else {
        startIndex = (currentPage - 1) * postsPerPage;
        endIndex = startIndex + postsPerPage;
      }
  
      const paginatedResults = reversedResults.slice(startIndex, endIndex);
      const formattedResults = paginatedResults.map(post => ({
        ...post,
        formattedCreatedAt: moment(post.post_created_at).format('YYYY-MM-DD')
      }));
  
      res.render('notice', {
        data: formattedResults,
        search: formattedResults, // 검색 결과를 전달
        totalPages: totalPages,
        currentPage: currentPage,
        prevPage,
        startPage,
        endPage,
        nextPage,
        keyword: keyword,
      });
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