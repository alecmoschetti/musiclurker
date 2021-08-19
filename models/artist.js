const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
    name: {type: String, required: true},
    profile: {type: String, required: true},
    portrait: {type: String}
});

/* virtuals */
ArtistSchema.virtual('url').get(function() {
    return `/catalog/artists/${this._id}`;
});

/* model export */
module.exports = mongoose.model('Artist', ArtistSchema);