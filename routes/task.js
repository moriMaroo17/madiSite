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
        fs.rmSync(`./docs/${task.name}`, { recursive: true, force: true })
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
        fs.rmSync(`./docs/${task.name}/${variant.number}/${req.body.subTaskName}`, { recursive: true, force: true })
        await task.deleteSubTaskById(req.body.variantId, req.body.subTaskId)
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

router.get('/:id/:number/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
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

router.post('/:id/:number/editVariant', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        let filePath = variant.filePath
        if (!fs.existsSync(`./docs/${task.name}/${req.body.number}/`)) {
            fs.mkdirSync(`./docs/${task.name}/${req.body.number}/`, { recursive: true })
        }
        fs.renameSync(`./docs/${task.name}/${variant.number}/`, `./docs/${task.name}/${req.params.number}/`)
        if (req.body.removeFile === 'on') {
            fs.rmSync(variant.filePath, { recursive: true, force: true })
            filePath = ''

        } else if (req.files) {
            let file = req.files.filePath
            if (fs.existsSync(variant.filePath)) {
                fs.rmSync(variant.filePath, { recursive: true, force: true })
            }
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

router.post('/:id/addVariant', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        if (!fs.existsSync(`./docs/${task.name}/${req.body.number}/`)) {
            fs.mkdirSync(`./docs/${task.name}/${req.body.number}/`, { recursive: true })
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

router.post('/:id/:number/addSubTask', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        if (!fs.existsSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`)) {
            fs.mkdirSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`, { require: true })
        }
        const result = await task.addSubTask(req.params.number, {
            name: req.body.name,
            filePath: '',
            taskText: '',
            asks: []
        })
        console.log(result)
        res.redirect(`/task/${req.params.id}/${req.params.number}/${result._id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number/:subId/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        const subTask = await task.getSubTaskById(variant.id, req.params.subId)
        const asks = await Ask.find({ taskId: req.params.id, variant: req.params.number, subTaskId: req.params.subId })
        asks.map(ask => {
            ask.size = `${ask.table.columns} X ${ask.table.rows}`
        })
        let fileName = ''
        if (subTask.filePath) {
            fileName = subTask.filePath.split('/')[subTask.filePath.split('/').length - 1]
        }
        res.render('editSubTask', {
            taskId: task.id,
            number: variant.number,
            subTask,
            fileName,
            asks
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/:number/:subId/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        const subTask = await task.getSubTaskById(variant.id, req.params.subId)
        let filePath = subTask.filePath
        if (!fs.existsSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`)) {
            fs.mkdirSync(`./docs/${task.name}/${req.params.number}/${req.body.name}/`, { recursive: true });
        }
        fs.renameSync(`./docs/${task.name}/${req.params.number}/${subTask.name}/`, `./docs/${task.name}/${req.params.number}/${req.body.name}/`)
        if (req.body.removeFile === 'on') {
            fs.rmSync(subTask.filePath, { recursive: true, force: true })
            filePath = ''
        } else if (req.files) {
            let file = req.files.filePath
            if (fs.existsSync(subTask.filePath)) {
                fs.rmSync(subTask.filePath, { recursive: true, force: true })
            }
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

router.post('/removeVariant', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.body.taskId)
        await task.deleteVariantById(req.body.variantId)
        fs.rmSync(`./docs/${task.name}/${req.body.number}`, { recursive: true, force: true })
        res.redirect(`/task/${req.body.taskId}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', teacherPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.body.id)
        if (!fs.existsSync(`./docs/${task.name}/`)) {
            fs.mkdirSync(`./docs/${task.name}/`, { recursive: true });
        }
        fs.renameSync(`docs/${task.name}/`, `docs/${req.body.name}`)
        task.name = req.body.name
        if (req.body.removeFile === 'on') {
            fs.rmSync(task.filePath, { recursive: true, force: true })
            task.filePath = ''
        } else if (req.files) {
            let file = req.files.filePath
            if (fs.existsSync(task.filePath)) {
                fs.rmSync(task.filePath, { recursive: true, force: true })
            }
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

router.get('/:id', studentPermission, async (req, res) => {
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

router.get('/:id/:number/:subId', studentPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        const subTask = await task.getSubTaskById(variant.id, req.params.subId)
        const asks = await Ask.find({ taskId: task.id, variant: variant.number, subTaskId: subTask.id })
        // const answer = await Answer.findOne({userId: req.session.user._id, taskId: req.params.id, variant: req.params.number, subTaskId: req.params.subId})
        let fileName = ''
        if (subTask.filePath) {
            fileName = subTask.filePath.split('/')[subTask.filePath.split('/').length - 1]
        }
        res.render('subTask', {
            taskId: task.id,
            variantNumber: variant.number,
            subTask,
            fileName,
            asks
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/:number', studentPermission, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        const variant = await task.getVariantByNumber(req.params.number)
        const fileNameArr = variant.filePath.split('/')
        res.render('variant', {
            title: `Вариант ${req.params.number}`,
            taskId: task.id,
            variant,
            fileName: fileNameArr[fileNameArr.length - 1]
        })
    } catch (error) {
        console.log(error)
    }
})

export { router as taskRouter }
