import { Router } from 'express'

import Answer from '../models/answer.js'
import Task from '../models/task.js'
import User from '../models/user.js'
import Ask from '../models/ask.js'
import { teacherPermission } from '../middleware/permission.js'

import helpers from '../utils/helpers.js'

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
        const asks = await Ask.find({ subTaskId: req.params.id })
        const info = await helpers.getInfoBySubTaskId(req.params.id)
        for (let i = 0; i < asks.length; i++) {
            let unpopAnswers = await Answer.find({ ask: asks[i].id }).populate({ path: 'ask' }).populate({ path: 'userId' , select: ['name', '_id']})
            for (let i = 0; i < unpopAnswers.length; i++) unpopAnswers[i] = await unpopAnswers[i].populateAllTaskFields()
            answers = answers.concat(unpopAnswers)
        }
        answers.map(answer => {
            if (answer.filePath) {
                answer.fileName = answer.filePath.split('/')[answer.filePath.split('/').length - 1]
            }
        })
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
        answers.map(answer => {
            if (answer.filePath) {
                answer.fileName = answer.filePath.split('/')[answer.filePath.split('/').length - 1]
            }
        })
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