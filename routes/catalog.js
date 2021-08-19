var express = require('express');
var router = express.Router();

/* require controller modules */
const album_controller = require('../controllers/albumController');
const artist_controller = require('../controllers/artistController');
const label_controller = require('../controllers/labelController');
const genre_controller = require('../controllers/genreController');

/* GET catalog home page. */
router.get('/', album_controller.index);

/* ~~~~~~~ ALBUM ROUTES ~~~~~~~~ */

/* GET request for creating Album. NOTE THIS MUST COME BEFORE ROUTE FOR ID (displaying album) */
router.get('/albums/create', album_controller.album_create_get);

// POST request for creating album
router.post('/albums/create', album_controller.album_create_post);

// GET request to delete album
router.get('/albums/:id/delete', album_controller.album_delete_get);

// POST request to delete album
router.post('/albums/:id/delete', album_controller.album_delete_post);

// GET request to update album.
router.get('/albums/:id/update', album_controller.album_update_get);

// POST request to update album.
router.post('/albums/:id/update', album_controller.album_update_post);

/* GET all albums list page */
router.get('/albums', album_controller.albums_list);

// GET request for one album
router.get('/albums/:id', album_controller.album_detail);

/* ~~~~~~~~ ARTIST ROUTES ~~~~~~~ */

// GET request for creating Artist. NOTE THIS MUST COME BEFORE ROUTE FOR ID (displaying artist)
router.get('/artists/create', artist_controller.artist_create_get);

// POST request for creating Artist
router.post('/artists/create', artist_controller.artist_create_post);

// GET request to delete Artist
router.get('/artists/:id/delete', artist_controller.artist_delete_get);

// POST request to delete Artist
router.post('/artists/:id/delete', artist_controller.artist_delete_post);

// GET request to update Artist.
router.get('/artists/:id/update', artist_controller.artist_update_get);

// POST request to update Artist.
router.post('/artists/:id/update', artist_controller.artist_update_post);

// GET all artists
router.get('/artists', artist_controller.artists_list);

// GET request for one artist
router.get('/artists/:id', artist_controller.artist_detail);

/* ~~~~~~~ GENRE ROUTES ~~~~~~~~ */

/* GET request for creating genre. NOTE THIS MUST COME BEFORE ROUTE FOR ID (displaying genre) */
router.get('/genres/create', genre_controller.genre_create_get);

// POST request for creating genre
router.post('/genres/create', genre_controller.genre_create_post);

// GET request to delete genre
router.get('/genres/:id/delete', genre_controller.genre_delete_get);

// POST request to delete genre
router.post('/genres/:id/delete', genre_controller.genre_delete_post);

// GET request to update genre.
router.get('/genres/:id/update', genre_controller.genre_update_get);

// POST request to update genre.
router.post('/genres/:id/update', genre_controller.genre_update_post);

/* GET all genres list page */
router.get('/genres', genre_controller.genres_list);

// GET request for one genre
router.get('/genres/:id', genre_controller.genre_detail);

/* ~~~~~~~ LABEL ROUTES ~~~~~~~~ */

/* GET request for creating label. NOTE THIS MUST COME BEFORE ROUTE FOR ID (displaying label) */
router.get('/labels/create', label_controller.label_create_get);

// POST request for creating label
router.post('/labels/create', label_controller.label_create_post);

// GET request to delete label
router.get('/labels/:id/delete', label_controller.label_delete_get);

// POST request to delete label
router.post('/labels/:id/delete', label_controller.label_delete_post);

// GET request to update label.
router.get('/labels/:id/update', label_controller.label_update_get);

// POST request to update label.
router.post('/labels/:id/update', label_controller.label_update_post);

/* GET all labels list page */
router.get('/labels', label_controller.labels_list);

// GET request for one label
router.get('/labels/:id', label_controller.label_detail);

module.exports = router;