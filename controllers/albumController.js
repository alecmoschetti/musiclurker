const Album = require('../models/album');
const Artist = require('../models/artist');
const Genre = require('../models/genre');
const Label = require('../models/label');

const path = require('path');
const async = require('async');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, '/' + file.fieldname + '-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* display catalog home page */
exports.index = (req, res) => {
    async.parallel({
        album_count: cb => Album.countDocuments({}, cb),
        artist_count: cb => Artist.countDocuments({}, cb),
        label_count: cb => Label.countDocuments({}, cb),
        genre_count: cb => Genre.countDocuments({}, cb)
    }, (err, results) => res.render('catalog', { title: 'Catalog', err, results }));
};

/* display list of all albums */
exports.albums_list = (req, res, next) => {
    Album.find({}, 'title artist cover')
        .populate('artist')
        .exec((err, list_albums) => err ? next(err) : res.render('albums_list', { title: 'Albums List', albums_list: list_albums}));
};

/* display detail page for a specific album */
exports.album_detail = (req, res, next) => {
    async.parallel({
        album: cb => Album.findById(req.params.id).populate('artist').populate('label').populate('genre').exec(cb),
        genres: cb => Genre.find({'albums': req.params.id}, 'title date_released genre').exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        else if (results.album === null) {
            err = new Error('Album not found');
            err.status = 404;
            return next(err);
        } else {
            const { album } = results;
            res.render('album_detail', { title: album.title, album });
        }
    });
};

/* display Album create form on GET */
exports.album_create_get = (req, res, next) => {
    async.parallel({
        artists: cb => Artist.find(cb),
        labels: cb => Label.find(cb),
        genres: cb => Genre.find(cb),
    }, (err, results) => {
        if (err) return next(err);
        const { artists, labels, genres } = results;
        res.render('album_form', { title: 'Create Album', artists, labels, genres, updating: false });
    });
};

/* display Album create on POST */
exports.album_create_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre); /* convert the genre to an array */
            }
        }
        next();
    },
    upload.single('cover'),
    body('album_title', 'Album title must not be empty').trim().isLength({min: 1}).escape(),
    body('abum_artist', 'Artist must not be empty').trim().escape(),
    body('abum_date_released').trim().escape(),
    body('album_tracks').trim().escape(),
    body('album_label').trim().escape(),
    body('genre.*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        const album = new Album({
            title: req.body.album_title,
            artist: req.body.album_artist,
            tracks: req.body.album_tracks,
            date_released: req.body.album_date_released,
            genre: req.body.genre,
            label: req.body.album_label,
            cover: '',
        });
        if (req.file) {
            album.cover = `/${req.file.path}`;
        }
        if (!errors.isEmpty()) { /* there are errors */
            async.parallel({
                artists: cb => Artist.find(cb),
                labels: cb => Label.find(cb),
                genres: cb => Genre.find(cb),
            }, (err, results) => {
                if (err) return next(err);
                for (let i = 0; i < results.genres.length; i++) {
                    if (album.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                const { artists, labels, genres } = results;
                res.render('album_form', { title: 'Create Album', artists, genres, labels, album, errors: errors.array() });
            });
            return;
        } else {
            album.save(err => {
                if (err) return next(err);
                res.redirect(album.url);
            })
        }
    }
];

/* display Album delete form on GET */
exports.album_delete_get = (req, res, next) => {
    async.parallel({
        album: cb => Album.findById(req.params.id).exec(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.album === null) res.redirect('/catalog/albums');
        res.render('album_delete', { title: 'Delete Album', album: results.album });
    });
};

/* display Album delete on POST */
exports.album_delete_post = (req, res, next) => {
    if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
        let err = new Error("The password entered is incorrect");
        err.status = 401;
        return next(err);
    } else {
        async.parallel({
            album: cb => Album.findById(req.params.id).exec(cb),
        }, (err, results) => {
            if (err) return next(err);
            Album.findByIdAndRemove(req.body.albumid, err => {
                if (err) return next(err);
                res.redirect('/catalog/albums');
            });
        });
    }
};

/* display Album update form on GET */
exports.album_update_get = (req, res, next) => {
    async.parallel({
        album: cb => Album.findById(req.params.id).populate('artist').populate('genre').populate('label').exec(cb),
        artists: cb => Artist.find(cb),
        labels: cb => Label.find(cb),
        genres: cb => Genre.find(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.album === null) {
            err = new Error('Album not found');
            err.status = 404;
            return next(err);
        }
        for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (let album_g_iter = 0; album_g_iter < results.album.genre.length; album_g_iter++) {
                if (results.genres[all_g_iter]._id.toString() === results.album.genre[album_g_iter]._id.toString()) {
                    results.genres[album_g_iter].checked = 'true';
                }
            }
        }
        const { artists, genres, labels, album } = results;
        res.render('album_form', { title: 'Update Album', artists, genres, labels, album, updating: true });
    });
};

/* display Album update on POST */
exports.album_update_post = [
    /* convert the genre to an array */
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },
    upload.single('cover'),
    body('album_title', 'Album title must not be empty').trim().isLength({min: 1}).escape(),
    body('abum_artist', 'Artist must not be empty').trim().escape(),
    body('abum_date_released').trim().escape(),
    body('album_tracks').trim().escape(),
    body('album_label').trim().escape(),
    body('genre.*').escape(),
    (req, res, next) => {
        if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
            let err = new Error("The password entered is incorrect");
            err.status = 401;
            return next(err);
        } else {
            const errors = validationResult(req);
            const album = new Album({
                title: req.body.album_title,
                artist: req.body.album_artist,
                tracks: req.body.album_tracks,
                date_released: req.body.album_date_released,
                label: req.body.album_label,
                genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
                cover: '',
                _id: req.params.id
            });
            if (req.file) {
                album.cover = `/${req.file.path}`;
            }
            if (!errors.isEmpty()) {
                async.parallel({
                    artists: cb => Artist.find(cb),
                    labels: cb => Label.find(cb),
                    genres: cb => Genre.find(cb),
                }, (err, results) => {
                    if (err) return next(err);
                    for (let i = 0; i < results.genres.length; i++) {
                        if (album.genre.indexOf(results.genres[i]._id) > -1) {
                            results.genres[i].checked = 'true';
                        }
                    }
                    const { artists, labels, genres } = results;
                    res.render('book_form', { title: 'Update Book', artists, labels, genres, album, errors: errors.array() });
                });
                return;
            } else {
                Album.findByIdAndUpdate(req.params.id, album, {}, (err, thealbum) => {
                    if (err) return next(err);
                    res.redirect(thealbum.url);
                });
            }
        }
    }
];