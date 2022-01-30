import mongoose from 'mongoose'

import Task from './task.js'

const answerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ask',
        required: true
    },
    answer: String,
    filePath: String,
    tableAnswer: [[{
        type: String
    }]]
})

answerSchema.methods.populateSubTask = async function() {
    const task = await Task.findById(this.taskId)
    const variant = await task.getVariantByNumber(this.variant)
    const subTask = await task.getSubTaskById(variant.id, this.subTaskId)
    return {
        _id: this._id,
        userId: this.userId,
        taskId: this.taskId,
        variant: this.variant,
        subTaskId: subTask,
        answer: this.answer
    }
}

export default mongoose.model('Answer', answerSchema)