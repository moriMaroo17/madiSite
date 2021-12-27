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

taskSchema.methods.addSubTask = function (subTask) {
    this.content.subTasks.push({
        name: subTask.name,
        filePath: subTask.filePath,
        answer: subTask.answer
    })
}

taskSchema.methods.getSubTaskById = function (id) {
    for (let i = 0; i < this.content.subTasks.length; i++) {
        if (this.content.subTasks[i].id === id) {
            return this.content.subTasks[i]
        }
    }
}

taskSchema.methods.deleteSubTaskById = function (id) {
    let subTasks = [...this.content.subTasks]
    subTasks = subTasks.filter(subTask => subTask.id.toString() !== id.toString())
    this.content.subTasks = subTasks
    return this.save()
}

export default mongoose.model('Task', taskSchema)