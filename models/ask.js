import mongoose from 'mongoose'

import Task from './task.js'

const askSchema = new mongoose.Schema({
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
    askText: String,
    isTable: {
        type: Boolean,
        required: true
    },
    table: {
        head: [{
            type: String,
            required: true
        }],
        rows: {
            type: Number,
            required: true
        }
    },
    rightAnswer: String
})

export default mongoose.model('Ask', askSchema)