import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: false
    },
    profilePic: {
        type: String,
        require: false
    },
    googleProfilePic: {
        type: String,
        require: false
    },
    active: {
        type: Boolean,
        require: true,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

export default User;