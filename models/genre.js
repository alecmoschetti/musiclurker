const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: {type: String, required: true, minLength: 3, maxLength: 30},
    description: {type: String, required: true}
});

/* virtuals */
GenreSchema.virtual('url').get(function() {
    return `/catalog/genres/${this._id}`;
});

/* model export */
module.exports = mongoose.model('Genre', GenreSchema);