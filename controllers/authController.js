const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`--- Login attempt for: ${email} ---`);  

    try {
        const user = await User.findOne({ email });
        console.log('User found in database:', user ? `Yes, ID: ${user._id}` : 'No');  

        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log('Password match result:', isMatch);  

            if (isMatch) {
                console.log('Login successful, generating token.');  
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                });
            } else {
                console.log('Login failed: Passwords do not match.');  
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            console.log('Login failed: User not found.'); 
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login process:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    res.status(200).json(req.user);
};


module.exports = {
    registerUser,
    loginUser,
    getMe,
};

