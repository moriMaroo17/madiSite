import mongoose from 'mongoose'


const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    filePath: String,
    variants: [{
        number: {
            type: Number,
            required: true
        },
        filePath: String,
        subTasks: [
            {
                name: {
                    type: String,
                    required: true,
                    unique: true
                },
                taskText: String,
                filePath: String,
                asks: [{
                    type: mongoose.Schema.Types.ObjectId
                }]
            }
        ],
    }]
})

taskSchema.methods.getVariantByNumber = function (number) {
    for (let i = 0; i < this.variants.length; i++) {
        if (this.variants[i].number.toString() === number.toString()) {
            return this.variants[i]
        }
    }
}

taskSchema.methods.getVariantById = function (id) {
    for (let i = 0; i < this.variants.length; i++) {
        if (this.variants[i].id.toString() === id.toString()) {
            return this.variants[i]
        }
    }
}

taskSchema.methods.addSubTask = function (number, subTask) {
    const variant = this.getVariantByNumber(number)
    variant.subTasks.push({
        name: subTask.name,
        filePath: subTask.filePath,
        taskText: subTask.taskText,
        answer: subTask.answer
    })

    return this.save()
}

taskSchema.methods.getSubTaskById = function (variantId, subTaskId) {
    const variant = this.getVariantById(variantId)
    for (let i = 0; i < variant.subTasks.length; i++) {
        if (variant.subTasks[i].id.toString() === subTaskId.toString()) {
            return variant.subTasks[i]
        }
    }
}

taskSchema.methods.deleteSubTaskById = function (variantId, subTaskId) {
    const variant = this.getVariantById(variantId)
    let subTasks = [...variant.subTasks]
    subTasks = subTasks.filter(subTask => subTask.id.toString() !== subTaskId.toString())
    variant.subTasks = subTasks
    return this.save()
}

taskSchema.methods.deleteVariantById = function (id) {
    let variants = [...this.variants]
    variants = variants.filter(variant => variant.id.toString() !== id.toString())
    this.variants = variants
    return this.save()
}

taskSchema.methods.updateVaraintByNumber = function (oldNumber, newNumber, filePath) {
    const variant = this.getVariantByNumber(oldNumber)
    if (newNumber !== undefined && newNumber !== variant.number) {
        variant.number = newNumber
    }
    if (filePath !== undefined && filePath !== variant.filePath) {
        variant.filePath = filePath
    }

    for (let i = 0; i < this.variants.length; i++) {
        if (this.variants[i].id === variant.id) {
            this.variants[i] = variant
            return this.save()
        }
    }
}

taskSchema.methods.updateSubTaskById = function (number, subId, name, taskText, filePath, answer) {
    const variant = this.getVariantByNumber(number)
    const subTask = this.getSubTaskById(variant.id, subId)
    if (name !== undefined && name !== subTask.name) {
        subTask.name = name
    }
    if (taskText !== undefined && taskText !== subTask.taskText) {
        subTask.taskText = taskText
    }
    if (filePath !== undefined && filePath !== subTask.filePath) {
        subTask.filePath = filePath
    }
    if (answer !== undefined && answer !== subTask.answer) {
        subTask.answer = answer
    }
    for (var i = 0; i < variant.subTasks.length; i++) {
        if (variant.subTasks[i].id === subTask.id) {
            variant.subTasks[i] = subTask
            return this.save()
        }
    }
}

export default mongoose.model('Task', taskSchema)