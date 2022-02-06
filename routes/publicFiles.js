import fs from 'fs'
import { Router } from 'express'
import PublicFile from '../models/publicFile.js'
import { teacherPermission, onlyAuthPermission } from '../middleware/permission.js'


const router = new Router()


router.get('/', onlyAuthPermission, async (req, res) => {
    try {
        const publicFiles = await PublicFile.find()
        publicFiles.map(file => {
            file.fileName = file.filePath.split('/')[file.filePath.split('/').length - 1]
        })
        res.render('watchUpload', {
            title: 'Загруженные файлы',
            publicFiles
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/add', teacherPermission, (req, res) => {
    res.render('addUpload', {
        title: 'Загрузка файла'
    })
})

router.post('/add', teacherPermission, async (req, res) => {
    try {
        let file = req.files.filePath
        file.mv(`./publicFiles/${req.files.filePath.name}`, (err) => {
            if (err) {
                console.log(err)
            }
        })
        const publicFile = new PublicFile({
            filePath: `./publicFiles/${req.files.filePath.name}`
        })
        await publicFile.save()
        res.redirect('/publicFiles')
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', teacherPermission, async (req, res) => {
    try {
        let publicFile = await PublicFile.findById(req.body.id)
        fs.rmSync(publicFile.filePath, { force: true })
        await PublicFile.findByIdAndDelete(req.body.id)
        res.redirect('/publicFiles')
    } catch (error) {
        console.log(error)
    }
})

export { router as publicFilesRouter }