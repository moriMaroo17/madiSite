import { Router } from 'express'
import Task from '../models/task.js'

const router = new Router()

router.get('/', (req, res) => {
    res.render('add', {
        title: 'Добавить работу'
    })
})

router.post('/', async (req, res) => {
    console.log(req.body)
    const task = new Task({
        name: req.body.name,
        filePath: req.body.filePath,
        content: req.body.content
    })
    try {
        await task.save()
        res.redirect(`task/${task.id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

export { router as addRouter}