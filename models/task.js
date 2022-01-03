import mongoose from 'mongoose'


const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    filePath: String,
    variants: [{
        number: {
            type: Number,
            required: true
        },
        subTasks: [
            {
                name: {
                    type: String,
                    required: true
                },
                description: String,
                filePath: String,
                answer: String
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
    const variant = getVariantById(variantId)
    let subTask = [...variant.subTasks]
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

export default mongoose.model('Task', taskSchema)