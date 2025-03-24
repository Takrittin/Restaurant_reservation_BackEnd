const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant')

//@desc Get all Reservations
//@route GET api/reservations
//@access Private
exports.getReservations = async (req, res, next)=>{
    let query;
    //General users can see only their reservations!
    if(req.user.role !== 'admin'){
        query = Reservation.find({user:req.user.id}).populate({
            path: 'restaurant',
            select: 'name address phone'
        });
    }else{
        if(req.params.restaurantId){
            console.log(req.params.restaurantId);
            query = Reservation.find({restaurant: req.params.restaurantId}).populate({
                path: 'restaurant',
                select: 'name address phone'
            })
        }else{
            query = Reservation.find().populate({
                path: 'restaurant',
                select: 'name address phone'
            });
        }
       
    }

    try{
        const Reservations = await query;
        res.status(200).json({success: true, count: Reservations.length, data: Reservations})
    }catch(err){
        console.log(err);
        return res.status(500).json({success: false, message: "Cannot find Reservation"});
    }
};

//@desc Get Single appoimtment
//@route GET /api/v1/Reservations/:id
//@access Public
exports.getReservation = async (req, res, next) => {
    try{
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address phone'
        });

        if(!reservation){
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: 'Cannot find reservation'});
    }


};

//@desc Add Reservation
//@route POST /api/v1/restaurants/:restaurantId/reservations/
//@access Private
exports.addReservation = async (req, res, next) => {
    try{
        req.body.restaurant = req.params.restaurantId;

        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if(!restaurant){
            return res.status(404).json({
                success: false,
                message: `No restaurant with the id of ${req.params.restaurantId}`
            })
        }
        req.body.user = req.user.id;
        const existedReservation = await Reservation.find({user:req.user.id});

        if(existedReservation.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 reservations`});
        }

        const reservation = await Reservation.create(req.body);
        res.status(200).json({
            success: true,
            data: reservation
        });
    }catch(error){
        console.log(error.stack);
        return res.status(500).json({
            success: false,
            message: 'Cannot create reservation'
        });
    }
};

//@desc Update Reservation
//@route PUT /api/reservations/:id
//@access Private
exports.updateReservation = async (req, res, next)=> {
    try {

        let reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`});
        }
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: reservation})
    }catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: 'Cannot update reservation'});
    }
};

//@desc Delete Reservation
//@route DELETE /api/reservations/:id
//@access Private
exports.deleteReservation = async (req, res, next)=> {
    try {
        const reservation = await Reservation.findById(req.params.id);
        
        if(!reservation){
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`})
        }

        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete reservation`});
        }

        await reservation.deleteOne();
        res.status(200).json({success: true, data: {}});
    }catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot delete reservation"});
    }
}