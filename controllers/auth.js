const User = require('../models/User');
const bcrypt = require("bcryptjs");

//@desc     register / clear cookie
//@route    POST /api/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body;
        const user = await User.create({
            name,
            phone,
            email,
            password,
            role
        });
        //const token = user.getSignedJwtToken();
        //res.status(200).json({ success: true },token);
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false });
        console.log(err.stack);
    }
};

//@desc     log in / clear cookie
//@route    POST /api/auth/register
//@access   Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, msg: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        // Create token
        //const token = user.getSignedJwtToken();
        //res.status(200).json({ success: true, token });
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, msg: 'Server error' });
    }
};
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        token
    });
};
//@desc     get me / clear cookie
//@route    GET /api/auth/register
//@access   Private

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

//@desc     Log user out / clear cookie
//@route    GET /api/auth/logout
//@access   Private
exports.logout=async(req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now()+ 10*1000),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        data:{}
    });
};



// @desc      Change User Password
// @route     PUT /api/auth/change_password
// @access    Private
exports.changePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { currentPassword, newPassword } = req.body;

        // Check if current password matches
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash new password before saving
        user.password = newPassword;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};