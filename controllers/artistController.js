const Artist = require('../models/artist');
const Album = require('../models/album');

const path = require('path');
const async = require('async');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, '/' + file.fieldname + '-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* display list of all artists */
exports.artists_list = (req, res, next) => {
    Artist.find()
        .sort([['name', 'ascending']])
        .exec((err, list_artists) => err ? next(err) : res.render('artists_list', { title: 'Artists List', artists_list: list_artists}));
};

/* display detail page for a specific artist */
exports.artist_detail = (req, res, next) => {
    async.parallel({
        artist: cb => Artist.findById(req.params.id).exec(cb),
        albums: cb => Album.find({'artist': req.params.id}, 'title date_released genre cover').populate('genre', 'name').exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        else if (results.artist === null) {
            err = new Error('Artist not found');
            err.status = 404;
            return next(err);
        } else {
            const { artist, albums } = results;
            res.render('artist_detail', { title: 'Artist Detail', artist, albums });
        }
    });
};

/* display artist create form on GET */
exports.artist_create_get = (req, res, next) => res.render('artist_form', { title: 'Create Artist', updating: false });

/* display artist create on POST */
exports.artist_create_post = [
    upload.single('portrait'),
    body('artist_name').trim().isLength({min: 1}).unescape().withMessage('Artist name must be specified'),
    body('artist_profile').trim().isLength({min: 1}).unescape().withMessage('Artist profile must be specified'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('artist_form', { title: 'Create Artist', artist: req.body, errors: errors.array() });
        } else {
            const artist = new Artist({
                name: req.body.artist_name,
                profile: req.body.artist_profile,
                portrait: '',
            });
            if (req.file) {
                artist.portrait = `/${req.file.path}`;
            }
            artist.save(err => {
                if (err) return next(err);
                res.redirect(artist.url);
            });
        }
    }
];

/* display artist delete form on GET */
exports.artist_delete_get = (req, res, next) => {
    async.parallel({
        artist: cb => Artist.findById(req.params.id).exec(cb),
        albums: cb => Album.find({'artist': req.params.id}).exec(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.artist === null) {
            res.redirect('/catalog/artists');
        }
        const { artist, albums } = results;
        res.render('artist_delete', { title: 'Delete Artist', artist, albums });
    });
};

/* display artist delete on POST */
exports.artist_delete_post = (req, res, next) => {
    if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
        let err = new Error("The password entered is incorrect");
        err.status = 401;
        return next(err);
    } else {
        async.parallel({
            artist: cb => Artist.findById(req.params.id).exec(cb),
            albums: cb => Album.find({'artist': req.params.id}).exec(cb),
        }, (err, results) => {
            if (err) return next(err);
            if (results.albums.length > 0) { /* artist has albums, cancel request */
                res.render('artist_delete', { title: 'Delete Artist', artist: results.artist, albums: results.albums });
                return;
            } else { /* artist has no albums, process delete */
                Artist.findByIdAndRemove(req.body.artist_id, err => {
                    if (err) return next(err);
                    res.redirect('/catalog/artists');
                });
            }
        });
    }
};

/* display artist update form on GET */
exports.artist_update_get = (req, res, next) => {
    Artist.findById(req.params.id, (err, artist) => {
        if (err) return next(err);
        if (artist === null) {
            err = new Error('Artist not found');
            err.status = 404;
            return next(err);
        }
        res.render('artist_form', { title: 'Update Artist', artist, updating: true });
    });
};

/* display artist update on POST */
exports.artist_update_post = [
    upload.single('portrait'),
    body('artist_name').trim().isLength({min: 1}).unescape().withMessage('Artist name must be specified'),
    body('artist_profile').trim().isLength({min: 1}).unescape().withMessage('Artist profile must be specified'),
    (req, res, next) => {
        if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
            let err = new Error("The password entered is incorrect");
            err.status = 401;
            return next(err);
        } else {
            const errors = validationResult(req);
            const artist = new Artist({
                name: req.body.artist_name,
                profile: req.body.artist_profile,
                portrait: '',
                _id: req.params.id
            });
            if (req.file) {
                artist.portrait = `/${req.file.path}`;
            }
            if (!errors.isEmpty()) {
                res.render('artist_form', { title: 'Update Artist', artist, errors: errors.array() });
                return;
            } else {
                Artist.findByIdAndUpdate(req.params.id, artist, {}, (err, theartist) => {
                    if (err) return next(err);
                    res.redirect(theartist.url);
                })
            }
        }
    }
];