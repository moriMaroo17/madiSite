import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    variant: {
        type: Number,
        required: true
    },
    subTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    answer: {
        type: String,
        required: true
    }
})

export default mongoose.model('Answer', answerSchema)