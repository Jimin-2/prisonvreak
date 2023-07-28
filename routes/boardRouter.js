const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const db = require('../config/db');
const moment = require('moment');

const router = express.Router();

// 라우트 수행
router.get('/board', (req, res) => {
    // 파일 읽기
    fs.readFile('views/list.html', 'utf8', (error, data) => {
        // DB 쿼리문 실행
        db.query('SELECT * FROM post', (error, results) => {
            // 응답
            res.send(ejs.render(data, {
                data: results
            }));
        });
    });
});

router.get('/board/delete/:post_num', (req, res) => {
    // DB 쿼리문 실행
    db.query('DELETE FROM post WHERE post_num = ?', [req.params.post_num], () => {
        res.redirect('/board');
    });
});

router.get('/board/insert', (req, res) => {
    // 파일 읽기
    fs.readFile('views/insert.html', 'utf8', (error, data) => {
        // 응답
        res.send(data);
    });
});

router.post('/board/insert', (req, res) => {
    // 변수 선언
    const body = req.body;

    // 현재 시간을 한국 시간으로 변환하여 포맷 지정 (YYYY-MM-DD HH:mm:ss)
    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // DB 쿼리문 실행
    db.query('INSERT INTO post (post_title, post_content, post_usernum, post_hit, post_created_at) VALUES (?, ?, ?, ?, ?)',
        [body.post_title, body.post_content, body.post_usernum, body.post_hit, koreanTime], () => {
            // 응답
            res.redirect('/board');
        });
});

router.get('/board/edit/:post_num', (req, res) => {
    // 파일 읽기
    fs.readFile('views/edit.html', 'utf8', (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } else {
            // DB 쿼리문 실행
            const query = 'SELECT * FROM post WHERE post_num = ?';
            const postNum = req.params.post_num;
            db.query(query, [postNum], (error, result) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                } else {
                    // 응답
                    res.send(ejs.render(data, {
                        data: result[0]
                    }));
                }
            });
        }
    });
});


router.post('/board/edit/:post_num', (req, res) => {
    // 변수 선언
    const body = req.body;

    const koreanTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // DB 쿼리 실행
    db.query(
        'UPDATE post SET post_title = ?, post_content = ?, post_updated_at = ? WHERE post_num = ?',
        [body.post_title, body.post_content, koreanTime, req.params.post_num],
        () => {
            // 응답
            res.redirect('/board');
        }
    );
});

module.exports = router;