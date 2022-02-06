import Task from '../models/task.js'

export default {
    getInfoBySubTaskId: async function(subTaskId) {
        const tasks = await Task.find()
        for (let i = 0; i < tasks.length; i++) {
            for (let j = 0; j < tasks[i].variants.length; j++) {
                let subTask = await tasks[i].getSubTaskById(tasks[i].variants[j]._id, subTaskId)
                if (subTask) return {task: tasks[i].name, variant: tasks[i].variants[j].number, subTask: subTask.name, subTaskText: subTask.taskText}
            }
        }
    }
}