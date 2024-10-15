const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    urls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'URL'
    }],
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,

})

//USING DOCUMENT MIDLLEWARE TO ENCRYPT THE PASSWORD BEFORE SAVING IT
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    //async version of hash method
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

//validate password match or not for login 
userSchema.methods.matchPassword = async function (pswd, pswdDB) {
    return await bcrypt.compare(pswd, pswdDB);
};

module.exports = mongoose.model('USER', userSchema)