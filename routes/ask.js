import fs from 'fs'
import { Router } from 'express'
import Ask from '../models/ask.js'
import { teacherPermission } from '../middleware/permission.js'

const router = new Router()

router.post('/add', teacherPermission, async (req, res) => {
    try {
        let isTable
        if (req.body.isTable === 'on') {
            isTable = true
        } else {
            isTable = false
        }
        const ask = new Ask({
            taskId: req.body.taskId,
            variant: req.body.number,
            subTaskId: req.body.subId,
            isTable: isTable,
            table: {
                columns: 0,
                rows: 0,
            }
        })

        const result = await ask.save()
        fs.mkdirSync(`./answers/${result._id}`)
        res.redirect(`${result._id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.get('/:askId/edit', teacherPermission, async (req, res) => {
    try {
        const ask = await Ask.findById(req.params.askId)
        res.render('editAsk', {
            title: 'Редактировать вопрос',
            ask
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', teacherPermission, async (req, res) => {
    try {
        const ask = await Ask.findById(req.body.askId)
        ask.askText = req.body.askText
        ask.rightAnswer = req.body.rightAnswer
        if (ask.isTable) {
            ask.table.columns = req.body.columns
            ask.table.rows = req.body.rows
        }
        if (!fs.existsSync(`./answers/${ask.id}`)) {
            fs.mkdirSync(`./answers/${ask.id}`)
        }
        await ask.save()
        res.redirect(`/task/${ask.taskId}/${ask.variant}/${ask.subTaskId}/edit`)
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', teacherPermission, async (req, res) => {
    try {
        const ask = await Ask.findById(req.body.id)
        await Ask.deleteOne({ _id: req.body.id })
        res.redirect(`/task/${ask.taskId}/${ask.variant}/${ask.subTaskId}/edit`)
    } catch (error) {
        console.log(error)
    }
})

export { router as askRouter }