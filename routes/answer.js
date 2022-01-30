import fs from 'fs'
import { Router } from 'express'

import Answer from '../models/answer.js'
import Ask from '../models/ask.js'
import { studentPermission } from '../middleware/permission.js'

const router = new Router()

router.get('/:id', studentPermission, async (req, res) => {
    try {
        let table = []
        const ask = await Ask.findById(req.params.id)
        if (ask.isTable) {
            for (let i = 0; i < ask.table.rows; i++) {
                let row = []
                for (let j = 0; j < ask.table.columns; j++) {
                    row.push('')
                }
                table.push(row)
            }
            console.log(table)
        }
        // console.log(ask.id)
        // console.log(req.session.user._id)
        const answer = await Answer.findOne({ ask: ask.id, userId: req.session.user._id })
        console.log(answer)
        res.render('answer', {
            title: 'Добавление ответа',
            ask,
            table,
            answer
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/', studentPermission, async (req, res) => {
    try {
        const ask = await Ask.findById(req.body.id)
        let tableAnswer = []
        let filePath = ''
        const answerText = req.body.answer !== undefined ? req.body.answer : ''
        if (!fs.existsSync(`./answers/${ask.id}/${req.session.user.id}/`)) {
            fs.mkdirSync(`./answers/${ask.id}/${req.session.user.id}/`)
        }
        if (req.files) {
            let file = req.files.filePath
            // console.log(file)
            // if (fs.existsSync(task.filePath)) {
            //     fs.rmSync(task.filePath, { recursive: true, force: true })
            // }
            file.mv(`./answers/${ask.id}/${req.session.user.id}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            filePath = `./answers/${ask.id}/${req.session.user.id}/${req.files.filePath.name}`
        }
        if (req.body.isTable) {
            let tableObj = []
            for (let [key, value] of Object.entries(req.body)) {
                if (key.startsWith('tableInput')) {
                    let numbers = key.split('-').slice(1).map(number => Number(number))
                    tableObj.push({
                        row: numbers[0],
                        column: numbers[1],
                        value
                    })
                }
            }

            let current_row_number = 0
            let current_row_arr = []
            for (let i = 0; i < tableObj.length; i++) {

                if (tableObj[i].row > current_row_number) {
                    tableAnswer.push(current_row_arr)
                    current_row_number = tableObj[i].row
                    current_row_arr = []
                }
                current_row_arr.push(tableObj[i].value)
                if (i === tableObj.length - 1) {
                    tableAnswer.push(current_row_arr)
                }
            }
        }
        if (req.body.answerId) {
            const answer = await Answer.findById(req.body.answerId)
            if (filePath && filePath !== answer.filePath) {
                if (fs.existsSync(answer.filePath)) {
                    fs.rmSync(answer.filePath, { recursive: true, force: true })
                }
            }
            answer.answer = req.body.answer
            answer.tableAnswer = tableAnswer
            answer.filePath = filePath ? filePath : answer.filePath
            await answer.save()
        } else {
            const answer = new Answer({
                userId: req.session.user._id,
                ask: req.body.id,
                answer: answerText,
                filePath: filePath,
                tableAnswer: tableAnswer
            })
            await answer.save()
        }
        res.redirect(`/task/${ask.taskId}/${ask.variant}/${ask.subTaskId}`)
    } catch (error) {
        console.error(error)
    }
})

export { router as answerRouter }