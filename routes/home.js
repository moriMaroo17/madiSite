import { Router } from 'express'
import Task from '../models/task.js'
import { onlyAuthPermission } from '../middleware/permission.js'

const router = new Router()

router.get('/', onlyAuthPermission, async (req, res) => {
    try {
        const tasks = await Task.find()

        res.render('index', {
            title: 'Главная страница',
            tasks: tasks
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as homeRouter } 