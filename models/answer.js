import mongoose from 'mongoose'

import Task from './task.js'

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

answerSchema.methods.populateSubTask = async function() {
    const task = await Task.findById(this.taskId)
    const variant = await task.getVariantByNumber(this.variant)
    const subTask = await task.getSubTaskById(variant.id, this.subTaskId)
    // console.log(subTask)
    // this.subTaskId = subTask
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