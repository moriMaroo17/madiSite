import { Router } from 'express'
import Task from '../models/task.js'

const router = new Router()

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find()
        console.log(tasks[0].content)

        res.render('index', {
            title: 'Главная страница',
            tasks: tasks
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as homeRouter } 