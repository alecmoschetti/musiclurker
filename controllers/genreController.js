const Genre = require('../models/genre');
const Album = require('../models/album');

const async = require('async');
const { body, validationResult } = require('express-validator');

/* display list of all genres */
exports.genres_list = (req, res, next) => {
    Genre.find().sort([['name', 'ascending']])
        .exec((err, list_genres) => err ? next(err) : res.render('genres_list', { title: 'Genre List', genre_list: list_genres }));
};

/* display detail page for a specific genre */
exports.genre_detail = (req, res, next) => {
    async.parallel({
        genre: cb => Genre.findById(req.params.id).exec(cb),
        albums: cb => Album.find({'genre': req.params.id}).populate('artist').exec(cb)
    }, (err, results) => {
        if (err) {
            return next(err);
        } else if (results.genre === null) {
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        } else {
            const { genre, albums} = results;
            res.render('genre_detail', { title: 'Genre Detail', genre, albums });
        }
    });
};

/* display genre create form on GET */
exports.genre_create_get = (req, res, next) => res.render('genre_form', { title: 'Create Genre', updating: false });;

/* display genre create on POST */
exports.genre_create_post = [
    body('genre_name', 'Genre name required').isLength({min: 3}).trim().escape(),
    body('genre_description', 'Genre description required').isLength({min: 1}).trim().unescape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const genre = new Genre({
            name: req.body.genre_name,
            description: req.body.genre_description
        });
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Create Genre', genre, errors: errors.array() });
            return;
        } else {
            Genre.findOne({ 'name': req.body.genre_name })
                .exec((err, found_genre) => {
                    if (err) return next(err);
                    if (found_genre) {
                        res.redirect(found_genre.url);
                    } else {
                        genre.save(err => err ? next(err) : res.redirect(genre.url))
                    }
                });
        }
    }
];

/* display genre delete form on GET */
exports.genre_delete_get = (req, res, next) => {
    async.parallel({
        genre: cb => Genre.findById(req.params.id).exec(cb),
        albums: cb => Album.find({'genre': req.params.id}).exec(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.genre === null) res.redirect('/catalog/genres');
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, albums: results.albums });
    });
};

/* display genre delete on POST */
exports.genre_delete_post = (req, res, next) => {
    if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
        let err = new Error("The password entered is incorrect");
        err.status = 401;
        return next(err);
    } else {
        async.parallel({
            genre: cb => Genre.findById(req.params.id).exec(cb),
            albums: cb => Album.find({'genre': req.params.id}).exec(cb),
        }, (err, results) => {
            if (err) return next(err);
            if (results.albums.length > 0) { /* genre is attached to certain albums */
                res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, albums: results.albums });
                return;
            } else {
                Genre.findByIdAndRemove(req.body.genreid, err => {
                    if (err) return next(err);
                    res.redirect('/catalog/genres');
                });
            }
        });
    }
};

/* display genre update form on GET */
exports.genre_update_get = (req, res, next) => {
    async.parallel({
        genre: cb => Genre.findById(req.params.id).exec(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.genre === null) {
            err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_form', { title: 'Update Genre', genre: results.genre, updating: true });
    });
};

/* display genre update on POST */
exports.genre_update_post = [
    body('genre_name', 'Genre name required').isLength({min: 3}).trim().escape(),
    body('genre_description', 'Genre description required').isLength({min: 1}).trim().unescape(),
    (req, res, next) => {
        if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
            let err = new Error("The password entered is incorrect");
            err.status = 401;
            return next(err);
        } else {
            const errors = validationResult(req);
            const genre = new Genre({
                name: req.body.genre_name,
                location: req.body.genre_description,
                _id: req.params.id
            });
            if (!errors.isEmpty()) {
                res.render('genre_form', { title: 'Update Genre', genre, errors: errors.array() });
                return;
            } else {
                Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
                    if (err) return next(err);
                    res.redirect(thegenre.url);
                });
            }
        }
    }
];