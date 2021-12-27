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
    try {
        if (!fs.existsSync(`./docs/${req.body.name}/`)){
            fs.mkdirSync(`./docs/${req.body.name}/`);
        }
        if (req.files) {
            let file = req.files.filePath 
            file.mv(`./docs/${req.body.name}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            var filePath = `./docs/${req.body.name}/${req.files.filePath.name}`
        } else {
            var filePath =''
        }
        const task = new Task({
            name: req.body.name,
            filePath: filePath,
            content: req.body.content
        })
        await task.save()
        res.redirect(`task/${task.id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

export { router as addRouter}