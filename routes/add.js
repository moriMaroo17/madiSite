import fs from 'fs'
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
        filePath: `./docs/${req.body.name}/${req.files.filePath.name}`,
        content: req.body.content
    })
    try {
        console.log(req.files)
        if (req.files) {
            let file = req.files.filePath
            if (!fs.existsSync(`./docs/${req.body.name}/`)){
                fs.mkdirSync(`./docs/${req.body.name}/`);
            }
            file.mv(`./docs/${req.body.name}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
        await task.save()
        res.redirect(`task/${task.id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

export { router as addRouter}