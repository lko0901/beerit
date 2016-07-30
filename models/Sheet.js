var mongoose = require('mongoose');

var sheetSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        unique: true
    },
    useremail: {
        type: String,
        required: true
    },
    form: {
        type: Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

sheetSchema.methods.mapObject = function(target) {
    var exceptions = ["createdAt", "_id", "__v"];
    for (var key in this.schema.paths) {
        if (exceptions.indexOf(key) < 0 && target[key]) {
            this[key] = target[key];
        }
    }
};

var Sheet = mongoose.model('sheet', sheetSchema);
module.exports = Sheet;
