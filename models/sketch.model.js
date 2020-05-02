const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const sketchSchema = new Schema(
    {
        tilenum: {type: Number, required: true, unique: true },
        productImage :{ data: Buffer, contentType: String }
    }
    , {
        timestamps: true,
    });

const Sketch = mongoose.model('Sketches', sketchSchema)

module.exports = Sketch;