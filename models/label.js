const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
    name: {type: String, required: true, maxLength: 50},
    location: {type: String, required: true}
});

/* virtuals */
LabelSchema.virtual('url').get(function() {
    return `/catalog/labels/${this._id}`;
});

/* model export */
module.exports = mongoose.model('Label', LabelSchema);