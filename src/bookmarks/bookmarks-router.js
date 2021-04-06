const { Router } = require('express')
const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const store = require('../store');

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(store.bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, desc, rating } = req.body;
        let bookmark = {};

        if (!title || (title && title.length < 1)) {
            logger.error(`title is required and must have a length greater than 1`)
            return res.status(400)
                .send('title is required')
        }
        if (!url || (url && (!url.startsWith('http') || !url.startsWith('https')))) {

            logger.error(`url is required and must start with http/https`)
            return res.status(400)
                .send('url is required and must start with http/https')
        }
        if (desc && !(desc.length < 1)) {
            logger.error(`desc length must be greater than 1`)
            return res.status(400)
                .send('invalid data')
        }
        if (rating && (!(typeof rating === "number")) || (rating < 1 || rating > 5)) {
            logger.error(`rating must be a number between 1 and 5 `)
            return res.status(400)
                .send('invalid data')
        }

        if (desc) {
            bookmark.desc = desc
        }
        if (rating) {
            bookmark.rating = rating
        }

        const id = uuid();

        bookmark = {
            id,
            ...bookmark,
            title,
            url,
            desc
        }


        store.bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${bookmark.id} created`)
        res.status(201)
            .location(`http://localhost:3000/bookmarks/${bookmark.id}`)
            .json(bookmark)
    })

bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res) => {
        const { bookmark_id } = req.params;

        const bookmark = bookmark.find(b => b.id == id)

        if (!bookmark) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('bookmark not found')
        }
        res.json(bookmark)
    })
    .delete((req, res) => {

        const { bookmark_id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`);
            return res
                .status(404)
                .send('Not found');
        }
        store.bookmarks.splice(bookmarkIndex, 1)
        logger.info(`Bookmark with id ${bookmark_id} deleted`)
        res
            .status(204)
            .end()
    })
module.exports = bookmarkRouter;
