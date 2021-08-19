const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const AlbumSchema = new Schema({
    title: {type: String, required: true},
    artist: {type: Schema.Types.ObjectId, ref: 'Artist', required: true},
    tracks: {type: Number, required: true},
    date_released: {type: Date},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
    label: {type: Schema.Types.ObjectId, ref: 'Label'},
    cover: {type: String},
});

/* virtuals */
AlbumSchema.virtual('url').get(function() {
    return `/catalog/albums/${this._id}`;
});

AlbumSchema.virtual('date_released_formatted').get(function() {
    return this.date_released ? `${DateTime.fromJSDate(this.date_released).plus({ days: 1 }).toLocaleString(DateTime.DATE_MED)}` : '';
});

// for the Date picker when creating/updating album
AlbumSchema.virtual('date_released_date_picker').get(function() {
    return this.date_released ? `${DateTime.fromJSDate(this.date_released).plus({ days: 1 }).toISODate()}` : '';
});

/* model export */
module.exports = mongoose.model('Album', AlbumSchema);