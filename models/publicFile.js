import mongoose from 'mongoose'


const publicFileSchema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true,
        unique: true,
    }
})

export default mongoose.model('PublicFile', publicFileSchema)