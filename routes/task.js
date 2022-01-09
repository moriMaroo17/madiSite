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
        const fileNameArr = task.filePath.split('/')
        res.render('task', {
            title: task.name,
            task: task,
            fileName: fileNameArr[fileNameArr.length - 1]
        })
    } catch (error) {
        console.error(error)
    }
})

// fix it
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
        let fileName = ''
        if (task.filePath) {
            fileName = task.filePath.split('/')[task.filePath.split('/').length - 1]
            console.log(fileName)
        }
        res.render('edit', {
            title: 'Редактировать работу',
            task,
            fileName
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number/edit', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        console.log(task)
        const variant = await task.getVariantByNumber(req.params.number)
        let fileName = ''
        if (variant.filePath) {
            fileName = variant.filePath.split('/')[variant.filePath.split('/').length - 1]
        }
        console.log(variant)
        res.render('editVariant', {
            title: 'Редактировать вариант',
            id: req.params.id,
            variant,
            fileName
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number/addSubTask', async function (req, res) {
    res.render('editSubTask', {
        title: 'Добавить тему',
        subTask: {},
        forEdit: false
    })
})

router.post('/:id/:number/editVariant', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        if (!fs.existsSync(`./docs/${task.name}/${req.body.number}/`)){
            fs.mkdirSync(`./docs/${task.name}/${req.body.number}/`)
        }
        let filePath = undefined
        fs.renameSync(`./docs/${task.name}/${variant.number}/`, `./docs/${task.name}/${req.params.number}/`)
        if (req.files) {
            let file = req.files.filePath
            fs.rmSync(variant.filePath, {recursive: true, force: true})
            file.mv(`./docs/${task.name}/${req.body.number}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            filePath = `./docs/${task.name}/${req.body.number}/${req.files.filePath.name}`
        }

        await task.updateVaraintByNumber(req.params.number, req.body.number, filePath)
    } catch (error) {
        console.error(error)
    }
    res.redirect(`/task/${req.params.id}/edit`)
})

router.post('/:id/addVariant', async (req, res) => {
    console.log('primary adder for variant works')
    try {
        const task = await Task.findById(req.params.id)
        if (!fs.existsSync(`./docs/${task.name}/${req.body.number}/`)){
            fs.mkdirSync(`./docs/${task.name}/${req.body.number}/`)
        }
        task.variants.push({
            number: req.body.number,
            filePath: '',
            subTasks: []
        })
        await task.save()
        res.redirect(`/task/${req.params.id}/${req.body.number}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/:number/addSubTask', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        console.log(req.body)
        if (!fs.existsSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`)){
            fs.mkdirSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`);
        }
        if (req.files) {
            let file = req.files.filePath
            
            file.mv(`./docs/${task.name}/${req.params.number}/${req.body.name}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            var filePath = `./docs/${task.name}/${req.params.number}/${req.body.name}/${req.files.filePath.name}`
        } else {
            var filePath = ''
        }
        await task.addSubTask(req.params.number, {
            name: req.body.name,
            filePath: filePath,
            taskText: req.body.taskText,
            answer: req.body.answer
        })
        await task.save()
        res.redirect(`/task/${req.params.id}/${req.params.number}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number/:subId/edit', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        const subTask = await task.getSubTaskById(variant.id, req.params.subId)
        let fileName = ''
        if (subTask.filePath) {
            fileName = subTask.filePath.split('/')[subTask.filePath.split('/').length - 1]
        }
        res.render('editSubTask', {
            subTask,
            forEdit: true,
            fileName
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/:number/:subId/edit', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        const subTask = await task.getSubTaskById(variant.id, req.params.subId)
        var filePath = undefined
        if (!fs.existsSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`)){
            fs.mkdirSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`);
        }
        fs.renameSync(`./docs/${task.name}/${req.params.number}/${subTask.name}/`, `./docs/${task.name}/${req.params.number}/${req.body.name}/`)

        if (req.files) {
            let file = req.files.filePath
            fs.rmSync(subTask.filePath, {recursive: true, force: true})
            file.mv(`./docs/${task.name}/${req.params.number}/${req.body.name}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            filePath = `./docs/${task.name}/${req.params.number}/${req.body.name}/${req.files.filePath.name}`
        }

        await task.updateSubTaskById(req.params.number, req.params.subId, req.body.name, req.body.taskText, filePath, req.body.answer)
        res.redirect(`/task/${req.params.id}/${req.params.number}/edit`)
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
        console.log(req.body, req.files)
        const task = await Task.findById(req.body.id)
        console.log(task)
        if (!fs.existsSync(`./docs/${task.name}/`)){
            fs.mkdirSync(`./docs/${task.name}/`);
        }
        fs.renameSync(`docs/${task.name}/`, `docs/${req.body.name}`)
        task.name = req.body.name
        
        if (req.files) {
            let file = req.files.filePath
            fs.rmSync(task.filePath, {recursive: true, force: true})
            file.mv(`./docs/${task.name}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            task.filePath = `./docs/${task.name}/${req.files.filePath.name}`
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

