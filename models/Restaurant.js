const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a restaurant name'],
        unique: true,
        trim: true,
        maxlength:[50, 'Name can not be more than 50 characters']
    }, 
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        maxlength: [13, 'Telephone Number cannot be more than 13 digits']
    },
    open_time: {
        type: String,
        required: [true, 'Please add an open time']
    },
    close_time: {
        type: String,
        required: [true, 'Please add an close time']
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
RestaurantSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'restaurant',
    justOne: false
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);