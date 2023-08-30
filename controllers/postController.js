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
    postModel.excludedUserNum(1, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
      const reversedResults = results.reverse();

      const postsPerPage = 3; // 한 페이지당 표시되는 게시물 수
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
    //const postsPerPage = 5; // 한 페이지당 표시되는 게시물 수

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
        search: searchResults,
        totalPages: totalPages,
        currentPage: currentPage,
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

    if (keyword) {
      postModel.searchKeyword(keyword, (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
          return;
        }

        if (results.length === 0) {
          res.send('<script>alert("검색결과가 없습니다."); history.back();</script>');
        } else {

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
            nextPage
          });
        }
      });
    } else {
      res.send('<script>alert("검색어를 입력하세요"); history.back();</script>');
    }
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