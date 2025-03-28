const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation.js');

//@desc Get all restaurants
//@route GET /api/restaurants
//@access Public
exports.getRestaurants = async (req, res, next)=>{
    try{
        let query;

        const reqQuery = {...req.query};
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`
        );

        query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');

        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else{ 
            query = query.sort('name');
        }

        //Pagination
        const page = parseInt(req.query.page, 10)||1;
        const limit = parseInt(req.query.limit, 10)||25;
        const startIndex = (page - 1)*limit
        const endIndex = page * limit
        const total = await Restaurant.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //Executing query
        const restaurants = await query;

        //pagination result
        const pagination = {};
        if(endIndex < total){
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
        res.status(200).json({success: true, count: restaurants.length, pagination,data: restaurants});
    }catch(err){
        res.status(400).json({success: false});
    }
   
};

//@desc Get single restaurants
//@route GET /api/restaurants/:id
//@access Public
exports.getRestaurant = async (req, res, next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            return res.status(400).json({success: false});
        }
        res.status(200).json({success: true, data: restaurant});
    }catch(err){
        console.log(err);
        res.status(400).json({success: false});
    }
    
}

//@desc Create restaurant
//@route POST /api/restaurants
//@access Private
exports.createRestaurant = async (req, res, next)=>{
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({success: true, data: restaurant});
}

//@desc Update restaurant
//@route PUT /api/restaurants/:id
//@access Private
exports.updateRestaurant = async (req, res, next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!restaurant){
            res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: restaurant});
    }catch(err){
        console.log(err);
        res.status(400).json({success: false});
    }
    
}

//@desc Delete restaurant
//@route DELETE /api/restaurants/:id
//@access Private
exports.deleteRestaurant = async (req, res, next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(400).json({success: false, message: `Restaurant not found with id ${req.params.id}`});
        }

        await Reservation.deleteMany({restaurant: req.params.id});
        await Restaurant.deleteOne({_id: req.params.id});


        res.status(200).json({success: true, data: restaurant});
    }catch(err){
        res.status(400).json({success: false});
    }
}