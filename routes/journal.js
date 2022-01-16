import { Router } from 'express'

import Answer from '../models/answer.js'
import Task from '../models/task.js'
import { teacherPermission } from '../middleware/permission.js'

const router = new Router()


router.get('/', teacherPermission, async (req, res) => {
    try {
        const tasks = await Task.find()
        res.render('journal', {
            title: 'Журнал',
            tasks
        })
    } catch (error) {
        console.log(error)
    }
})


router.get('/watchBySubTask/:id', async (req, res) => {
    try {
        const info = {
            task: '',
            variant: '',
            subTask: '',
            subTaskText: ''
        }
        const answers = await Answer.find({ subTaskId: req.params.id }).populate({ path: 'userId', select: 'name' }).populate({ path: 'taskId', select: 'name' })
        for (let i = 0; i < answers.length; i++) {
            answers[i] = await answers[i].populateSubTask()
            if (i === 0) {
                info.task = answers[i].taskId.name
                info.variant = answers[i].variant
                info.subTask = answers[i].subTaskId.name
                info.subTaskText = answers[i].subTaskId.taskText
            }
        }
        console.log(answers)
        res.render('watchBySubTask', {
            title: `Ответы по теме ${info.subTask}`,
            info,
            answers
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as journalRouter }