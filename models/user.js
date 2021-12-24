import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

export default mongoose.model('User', userSchema)