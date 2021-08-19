const Label = require('../models/label');
const Album = require('../models/album');

const async = require('async');
const { body, validationResult } = require('express-validator');

/* display list of all labels */
exports.labels_list = (req, res, next) => {
    Label.find()
    .sort([['name', 'ascending']])
    .exec((err, list_labels) => err ? next(err) : res.render('labels_list', { title: 'Labels List', labels_list: list_labels }));
};

/* display detail page for a specific label */
exports.label_detail = (req, res, next) => {
    async.parallel({
        label: cb => Label.findById(req.params.id).exec(cb),
        albums: cb => Album.find({'label': req.params.id}, 'title date_released cover').populate('genre').populate('artist').exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        else if (results.label === null) {
            err = new Error('Label not found');
            err.status = 404;
            return next(err);
        } else {
            const { label, albums } = results;
            res.render('label_detail', { title: 'Label Detail', label, albums });
        }
    });
};

/* display label create form on GET */
exports.label_create_get = (req, res, next) => res.render('label_form', { title: 'Create Label', updating: false });

/* display label create on POST */
exports.label_create_post = [
    body('label_name').trim().isLength({min: 1}).unescape().withMessage('Label name must be specified'),
    body('label_location').trim().isLength({min: 1}).unescape().withMessage('Label location must be specified'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('label_form', { title: 'Create Label', label: req.body, errors: errors.array() });
        } else {
            const label = new Label({
                name: req.body.label_name,
                location: req.body.label_location,
            });
            label.save(err => {
                if (err) return next(err);
                res.redirect(label.url);
            });
        }
    }
];

/* display label delete form on GET */
exports.label_delete_get = (req, res, next) => {
    async.parallel({
        label: cb => Label.findById(req.params.id).exec(cb),
        albums: cb => Album.find({'label': req.params.id}).exec(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.label === null) res.redirect('/catalog/labels');
        res.render('label_delete', { title: 'Delete Label', label: results.label, albums: results.albums });
    });
};

/* display label delete on POST */
exports.label_delete_post = (req, res, next) => {
    if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
        let err = new Error("The password entered is incorrect");
        err.status = 401;
        return next(err);
    } else {
        async.parallel({
            label: cb => Label.findById(req.params.id).exec(cb),
            albums: cb => Album.find({'label': req.params.id}).exec(cb),
        }, (err, results) => {
            if (err) return next(err);
            if (results.albums.length > 0) { /* label is attached to certain albums */
                res.render('label_delete', { title: 'Delete Label', label: results.label, albums: results.albums });
                return;
            } else {
                Label.findByIdAndRemove(req.body.labelid, err => {
                    if (err) return next(err);
                    res.redirect('/catalog/labels');
                });
            }
        });
    }
};

/* display label update form on GET */
exports.label_update_get = (req, res, next) => {
    async.parallel({
        label: cb => Label.findById(req.params.id).exec(cb),
    }, (err, results) => {
        if (err) return next(err);
        if (results.label === null) {
            err = new Error('Label not found');
            err.status = 404;
            return next(err);
        }
        res.render('label_form', { title: 'Update Label', label: results.label, updating: true });
    });
};

/* display label update on POST */
exports.label_update_post = [
    body('label_name').trim().isLength({min: 1}).unescape().withMessage('Label name must be specified'),
    body('label_location').trim().isLength({min: 1}).unescape().withMessage('Label location must be specified'),
    (req, res, next) => {
        if (req.body.admin_password != process.env.ADMIN_PASSWORD) {
            let err = new Error("The password entered is incorrect");
            err.status = 401;
            return next(err);
        } else {
            const errors = validationResult(req);
            const label = new Label({
                name: req.body.label_name,
                location: req.body.label_location,
                _id: req.params.id
            });
            if (!errors.isEmpty()) {
                res.render('label_form', { title: 'Update Label', label, errors: errors.array() });
                return;
            } else {
                Label.findByIdAndUpdate(req.params.id, label, {}, (err, thelabel) => {
                    if (err) return next(err);
                    res.redirect(thelabel.url);
                });
            }
        }
    }
];