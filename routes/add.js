import fs from 'fs'
import { Router } from 'express'
import Task from '../models/task.js'
import { teacherPermission } from '../middleware/permission.js'

const router = new Router()

router.get('/', teacherPermission, (req, res) => {
    res.render('add', {
        title: 'Добавить работу'
    })
})

router.post('/', teacherPermission, async (req, res) => {
    try {
        const task = new Task({
            name: req.body.name,
            filePath: "",
            variants: []
        })
        const result = await task.save()
        if (!fs.existsSync(`./docs/${result._id}/`)){
            fs.mkdirSync(`./docs/${result._id}/`);
        }
        if (req.files) {
            let file = req.files.filePath 
            file.mv(`./docs/${result._id}/${req.files.filePath.name}`, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            var filePath = `./docs/${result._id}/${req.files.filePath.name}`
        } else {
            var filePath =''
        }
        await Task.updateOne({'_id': result._id}, {'filePath': filePath})
        res.redirect(`task/${result._id}/edit`)
    } catch (error) {
        console.log(error)
    }
})

export { router as addRouter}