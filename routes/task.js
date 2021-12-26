import fs from 'fs'
import { Router } from 'express'
import Task from '../models/task.js'

const router = new Router()

router.post('/remove', async (req, res) => {
    // console.log(req.body)
    try {
        const task = await Task.findById(req.body.id)
        console.log(task)
        fs.rmSync(`./docs/${task.name}`, {recursive: true, force: true})
        await Task.deleteOne({_id: req.body.id})
        res.redirect('/')
    } catch (error) {
        console.error(error)
    }
})

router.post('/removeSubTask', async (req, res) => {
    console.log(req.body)
    try {
        const task = await Task.findById(req.body.id)
        console.log(task)
        fs.rmSync(`./docs/${task.name}/*`, {recursive: true, force: true})
        await task.deleteSubTaskById(req.body.subTaskId)
        res.redirect(`/${req.body.id}/edit`)
    } catch (error) {
        console.error(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        res.render('task', {
            title: task.name,
            task: task,
        })
    } catch (error) {
        console.error(error)
    }
})

router.get('/:id/subTask/:subTaskId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        // console.log(req.params.subTaskId)
        const subTask = await task.getSubTaskById(req.params.subTaskId)
        console.log(subTask)
        res.render('subTask', {
            title: subTask.name,
            subTask: subTask,
        })
    } catch (error) {
        console.error(error)
    }
})



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
        console.log(req.body)
        if (req.files) {
            let file = req.files.filePath
            if (!fs.existsSync(`./docs/${task.name}/${req.body.name}/`)){
                fs.mkdirSync(`./docs/${task.name}/${req.body.name}/`);
            }
            file.mv(`./docs/${task.name}/${req.body.name}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            var filePath = `./docs/${task.name}/${req.body.name}/${req.files.filePath.name}`
        } else {
            var filePath = ''
        }
        await task.addSubTask({
            name: req.body.name,
            filePath: filePath,
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

