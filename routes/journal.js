import { Router } from 'express'

import Answer from '../models/answer.js'
import Task from '../models/task.js'
import User from '../models/user.js'
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

router.get('/watchBySubTask/:id', teacherPermission, async (req, res) => {
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

router.get('/watchByStudent/:id', teacherPermission, async (req, res) => {
    try {
        const student = {
            name: '',
            email: '',
        }
        const answers = await Answer.find({ userId: req.params.id}).populate({ path: 'userId', select: ['name', 'email'] }).populate({ path: 'taskId', select: 'name' }).sort({'taskId': 1})
        for (let i = 0; i < answers.length; i++) {
            answers[i] = await answers[i].populateSubTask()
            if (i === 0) {
                student.name = answers[i].userId.name
                student.email = answers[i].userId.email
            }
        }
        res.render('watchByStudent', {
            title: `Ответы студента ${student.name}`,
            student,
            answers
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/students', teacherPermission, async (req, res) => {
    try {
        const students = await User.find({'role': 'student'})
        res.render('students', {
            title: 'Список студентов',
            students
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as journalRouter }