import { Router } from 'express'
import Task from '../models/task.js'

const router = new Router()

// router.get('/:id/:variant', (req, res) => {
//     res.render('task', {
//         title: `Работа ${req.params.id}`,
//         filePath: '../../file/example.pdf'
//     })
// })



router.get('/:id/edit', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        console.log(task)
        res.render('edit', {
            title: 'Редактировать работу',
            data: {
                name: task.name,
                filePath: task.filePath,
                content: task.content,
                id: req.params.id
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/addContent', (req, res) => {
    res.render('addContent', {
        title: 'Добавить тему',
        id: req.params.id
    })
})

router.post('/addContent', async (req, res) => {
    try {
        const task = await Task.findById(req.body.id)
        // delete req.body.id
        // Object.assign(task.content.subTasks, req.body)
        console.log(req.body)
        task.addSubTask({
            name: req.body.name,
            filePath: req.body.filePath,
            answer: req.body.answer
        })
        await task.save()
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
})

router.get('/start', (req, res) => {
    res.redirect(`task/${req.query.id}/${req.query.variant}`)
})

export {router as taskRouter}

