import fs from 'fs'
import { Router } from 'express'
import Task from '../models/task.js'
import Answer from '../models/answer.js'
import Ask from '../models/ask.js'
import { teacherPermission, studentPermission } from '../middleware/permission.js'

const router = new Router()

router.post('/remove', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.body.id)
        task.variants.forEach(variant => {
            variant.subTasks.forEach(async subTask => {
                const asks = await Ask.find({ subTaskId: subTask._id })
                asks.forEach(async ask => {
                    const answers = await Answer.find({ ask: ask._id })
                    answers.forEach(answer => {
                        fs.rmdirSync(`./answers/${answer.ask._id}`, { recursive: true, force: true })
                    })
                    await Answer.deleteMany({ ask: ask._id })
                })
                await Ask.deleteMany({ subTaskId: req.body.subTaskId })
            })
        })
        fs.rmSync(`./docs/${task._id}`, { recursive: true, force: true })
        await Task.deleteOne({ _id: req.body.id })
        res.redirect('/')
    } catch (error) {
        console.error(error)
    }
})

router.post('/removeSubTask', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.body.id)
        const variant = await task.getVariantById(req.body.variantId)
        fs.rmSync(`./docs/${task._id}/${variant._id}/${req.body.subTaskName}`, { recursive: true, force: true })
        await task.deleteSubTaskById(req.body.variantId, req.body.subTaskId)
        const asks = await Ask.find({ subTaskId: req.body.subTaskId })
        asks.forEach(async ask => {
            const answers = await Answer.find({ ask: ask._id })
            answers.forEach(answer => {
                fs.rmdirSync(`./answers/${answer.ask._id}`, { recursive: true, force: true })
            })
            await Answer.deleteMany({ ask: ask._id })
        })
        await Ask.deleteMany({ subTaskId: req.body.subTaskId })
        res.redirect(`/task/${req.body.id}/edit`)
    } catch (error) {
        console.error(error)
    }
})

router.get('/:id/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        let fileName = ''
        if (task.filePath) {
            fileName = task.filePath.split('/')[task.filePath.split('/').length - 1]
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

router.get('/:id/:variantId/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantById(req.params.variantId)
        let fileName = ''
        if (variant.filePath) {
            fileName = variant.filePath.split('/')[variant.filePath.split('/').length - 1]
        }
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

router.post('/:id/:variantId/editVariant', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantById(req.params.variantId)
        let filePath = variant.filePath
        if (!fs.existsSync(`./docs/${task._id}/${req.body.variantId}/`)) {
            fs.mkdirSync(`./docs/${task._id}/${req.body.variantId}/`, { recursive: true })
        }
        // fs.renameSync(`./docs/${task._id}/${variant.variantId}/`, `./docs/${task._id}/${req.params.number}/`)
        if (req.body.removeFile === 'on') {
            fs.rmSync(variant.filePath, { recursive: true, force: true })
            filePath = ''

        } else if (req.files) {
            let file = req.files.filePath
            if (fs.existsSync(variant.filePath)) {
                fs.rmSync(variant.filePath, { recursive: true, force: true })
            }
            file.mv(`./docs/${task._id}/${req.body.number}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            filePath = `./docs/${task._id}/${req.body.number}/${req.files.filePath.name}`
        }

        await task.updateVaraintById(req.params.variantId, req.body.number, filePath)
    } catch (error) {
        console.error(error)
    }
    res.redirect(`/task/${req.params.id}/edit`)
})

router.post('/:id/addVariant', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.addVariant(req.body.number)
        if (!fs.existsSync(`./docs/${task._id}/${variant._id}/`)) {
            fs.mkdirSync(`./docs/${task._id}/${variant._id}/`, { recursive: true })
        }
        
        // await task.save()
        res.redirect(`/task/${req.params.id}/${variant._id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/:variantId/addSubTask', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        
        const subTask = await task.addSubTask(req.params.variantId, {
            name: req.body.name,
            filePath: '',
            taskText: '',
            asks: []
        })
        console.log(subTask)
        if (!fs.existsSync(`./docs/${task._id}/${req.params.variantId}/${subTask._id}/`)) {
            fs.mkdirSync(`./docs/${task._id}/${req.params.variantId}/${subTask._id}/`, { require: true })
        }
        res.redirect(`/task/${req.params.id}/${req.params.variantId}/${subTask._id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:variantId/:subId/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        // const variant = await task.getVariantById(req.params.variantId)
        const subTask = await task.getSubTaskById(req.params.variantId, req.params.subId)
        const asks = await Ask.find({ taskId: req.params.id, variantId: req.params.variantId, subTaskId: req.params.subId })
        asks.map(ask => {
            ask.size = `${ask.table.columns} X ${ask.table.rows}`
        })
        let fileName = ''
        if (subTask.filePath) {
            fileName = subTask.filePath.split('/')[subTask.filePath.split('/').length - 1]
        }
        res.render('editSubTask', {
            taskId: task.id,
            variantId: req.params.variantId,
            subTask,
            fileName,
            asks
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/:variantId/:subId/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        // const variant = await task.getVariantById(req.params.variantId)
        const subTask = await task.getSubTaskById(req.params.variantId, req.params.subId)
        let filePath = subTask.filePath
        if (!fs.existsSync(`./docs/${task._id}/${req.params.variantId}/${subTask._id}/`)) {
            fs.mkdirSync(`./docs/${task._id}/${req.params.variantId}/${subTask._id}/`, { recursive: true });
        }
        // fs.renameSync(`./docs/${task._id}/${req.params.number}/${subTask.name}/`, `./docs/${task._id}/${req.params.number}/${subTask._id}/`)
        if (req.body.removeFile === 'on') {
            fs.rmSync(subTask.filePath, { recursive: true, force: true })
            filePath = ''
        } else if (req.files) {
            let file = req.files.filePath
            if (fs.existsSync(subTask.filePath)) {
                fs.rmSync(subTask.filePath, { recursive: true, force: true })
            }
            file.mv(`./docs/${task._id}/${req.params.variantId}/${subTask._id}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            filePath = `./docs/${task._id}/${req.params.variantId }/${subTask._id}/${req.files.filePath.name}`
        }

        await task.updateSubTaskById(req.params.variantId, req.params.subId, req.body.name, req.body.taskText, filePath)
        res.redirect(`/task/${req.params.id}/${req.params.variantId}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/removeVariant', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.body.taskId)
        const variant = await task.getVariantById(req.body.variantId)
        variant.subTasks.forEach(async subTask => {
            const asks = await Ask.find({ subTaskId: subTask._id })
            asks.forEach(async ask => {
                const answers = await Answer.find({ ask: ask._id })
                answers.forEach(answer => {
                    fs.rmdirSync(`./answers/${answer.ask._id}`, { recursive: true, force: true })
                })
                await Answer.deleteMany({ ask: ask._id })
            })
            await Ask.deleteMany({ subTaskId: req.body.subTaskId })
        })
        await task.deleteVariantById(req.body.variantId)
        fs.rmSync(`./docs/${task._id}/${req.body.number}`, { recursive: true, force: true })
        res.redirect(`/task/${req.body.taskId}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.body.id)
        if (!fs.existsSync(`./docs/${task._id}/`)) {
            fs.mkdirSync(`./docs/${task._id}/`, { recursive: true });
        }
        // fs.renameSync(`docs/${task.name}/`, `docs/${req.body.name}`)
        task.name = req.body.name
        if (req.body.removeFile === 'on') {
            fs.rmSync(task.filePath, { recursive: true, force: true })
            task.filePath = ''
        } else if (req.files) {
            let file = req.files.filePath
            if (fs.existsSync(task.filePath)) {
                fs.rmSync(task.filePath, { recursive: true, force: true })
            }
            file.mv(`./docs/${task._id}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            task.filePath = `./docs/${task._id}/${req.files.filePath.name}`
        }

        await task.save()
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', studentPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        let fileName = ''
        if (task.filePath) {
            fileName = task.filePath.split('/')[subTask.filePath.split('/').length - 1]
        }
        // const fileNameArr = task.filePath.split('/')
        res.render('task', {
            title: task.name,
            task: task,
            fileName: fileName
        })
    } catch (error) {
        console.error(error)
    }
})

router.get('/:id/:variantId/:subId', studentPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        // const variant = await task.getVariantByNumber(req.params.variantId)
        const subTask = await task.getSubTaskById(req.params.variantId, req.params.subId)
        const asks = await Ask.find({ taskId: task.id, variantId: req.params.variantId, subTaskId: subTask.id })
        // const answer = await Answer.findOne({userId: req.session.user._id, taskId: req.params.id, variant: req.params.number, subTaskId: req.params.subId})
        let fileName = ''
        if (subTask.filePath) {
            fileName = subTask.filePath.split('/')[subTask.filePath.split('/').length - 1]
        }
        res.render('subTask', {
            taskId: task.id,
            variantId: req.params.variantId,
            subTask,
            fileName,
            asks
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:variantId', studentPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantById(req.params.variantId)
        let fileName = ''
        if (variant.filePath) {
            fileName = variant.filePath.split('/')[variant.filePath.split('/').length - 1]
        }
        res.render('variant', {
            title: `Вариант ${variant.number}`,
            taskId: task.id,
            variant,
            fileName: fileName
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as taskRouter }
