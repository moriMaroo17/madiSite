import { Router } from 'express'

import Answer from '../models/answer.js'
import Task from '../models/task.js'
import User from '../models/user.js'
import Ask from '../models/ask.js'
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
        let answers = []
        const info = {
            task: '',
            variant: '',
            subTask: '',
            subTaskText: '',
        }
        const asks = await Ask.find({ subTaskId: req.params.id })
        for (let i = 0; i < asks.length; i++) {
            let unpopAnswers = await Answer.find({ ask: asks[i].id }).populate({ path: 'ask' }).populate({ path: 'userId' , select: ['name', '_id']})
            for (let i = 0; i < unpopAnswers.length; i++) unpopAnswers[i] = await unpopAnswers[i].populateAllTaskFields()
            // unpopAnswers.map(async a => {
            //     a = await a.populateAllTaskFields()
            // })
            answers = answers.concat(unpopAnswers)
        }
        console.log(answers)
        info.task = answers[0].ask.taskId.name
        info.variant = answers[0].ask.variant.number
        info.subTask = answers[0].ask.subTaskId.name
        info.subTaskText = answers[0].ask.subTaskId.taskText
        res.render('watchBySubTask', {
            title: `Ответы по теме ${info.subTask}`,
            info,
            answers
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/watchTable/:id', teacherPermission, async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id).populate({ path: 'ask'}).populate({ path: 'userId'})
        console.log(answer)
        res.render('watchTable', {
            title: 'Просмотр таблицы',
            answer
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/watchByStudent/:id', teacherPermission, async (req, res) => {
    try {
        const answers = await Answer.find({ userId: req.params.id }).populate({ path: 'userId', select: ['name', 'email'] }).populate({ path: 'ask' }).sort({ 'taskId': 1 })
        for (let i = 0; i < answers.length; i++) answers[i] = await answers[i].populateAllTaskFields()
        const user = await User.findById(req.params.id)
        res.render('watchByStudent', {
            title: `Ответы студента ${user.name}`,
            answers,
            user,
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/students', teacherPermission, async (req, res) => {
    try {
        const students = await User.find({ 'role': 'student' })
        res.render('students', {
            title: 'Список студентов',
            students
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as journalRouter }