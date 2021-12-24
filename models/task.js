import mongoose from 'mongoose'


const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    filePath: String,
    content: {
        subTasks: [
            {
                name: {
                    type: String,
                    required: true
                },
                filePath: String,
                answer: String
            }
        ],
    }
})

taskSchema.methods.addSubTask = function(subTask) {
    this.content.subTasks.push({
        name: subTask.name,
        filePath: subTask.filePath,
        answer: subTask.answer
    })
}

export default mongoose.model('Task', taskSchema)