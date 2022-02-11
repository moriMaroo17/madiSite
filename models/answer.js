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

answerSchema.methods.populateAllTaskFields = async function() {
    // const ask = await Ask.findById(this.ask)
    // use only after populate ask
    const task = await Task.findById(this.ask.taskId)
    const variant = await task.getVariantById(this.ask.variantId)
    const subTask = await task.getSubTaskById(variant.id, this.ask.subTaskId)
    return {
        _id: this._id,
        userId: this.userId,
        ask: {
            id: this.ask._id,
            taskId: task,
            variant: variant,
            subTaskId: subTask,
            isTable: this.ask.isTable,
            askText: this.ask.askText,
            rightAnswer: this.ask.rightAnswer,
        },
        answer: this.answer,
        filePath: this.filePath,
        tableAnswer: this.tableAnswer,
    }
}

export default mongoose.model('Answer', answerSchema)