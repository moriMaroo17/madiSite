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
    try {
        const task = await Task.findById(req.body.id)
        console.log(task)
        fs.rmSync(`./docs/${task.name}/${req.body.subTaskName}`, {recursive: true, force: true})
        await task.deleteSubTaskById(req.body.variantId, req.body.subTaskId)
        res.redirect(`/task/${req.body.id}/edit`)
    } catch (error) {
        console.error(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        console.log(task)
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
                variants: task.variants,
                id: req.params.id
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        console.log(task)
        const variant = await task.getVariantByNumber(req.params.number)
        console.log(variant)
        res.render('editVariant', {
            title: 'Редактировать вариант',
            id: req.params.id,
            variant
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number/addSubTask', async function (req, res) {
    res.render('editSubTask', {
        title: 'Добавить тему',
        subTask: {}
    })
})

router.post('/:id/addVariant', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        task.variants.push({
            number: req.body.number,
            subTasks: []
        })
        await task.save()
        res.redirect(`/task/${req.params.id}/${req.body.number}/`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/:number/addSubTask', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
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
        await task.addSubTask(req.params.number, {
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

router.post('/removeVariant', async (req, res) => {
    try {
        const task = await Task.findById(req.body.taskId)
        console.log(task)
        await task.deleteVariantById(req.body.variantId)
        fs.rmSync(`./docs/${task.name}/${req.body.number}`, {recursive: true, force: true})
        res.redirect(`/task/${req.body.taskId}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', async (req, res) => {
    try {
        let task = await Task.findById(req.body.id)
        task.name = req.body.name
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
            task.filePath = filePath
        }

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

