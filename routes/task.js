import { Router } from 'express'

const router = new Router()

router.get('/:id/:variant', (req, res) => {
    res.render('task', {
        title: `Работа ${req.params.id}`,
        filePath: '../../file/example.pdf'
    })
})

router.get('/add', (req, res) => {
    res.render('add', {
        title: 'Добавить работу'
    })
})

router.get('/start', (req, res) => {
    res.redirect(`task/${req.query.id}/${req.query.variant}`)
})

export {router as taskRouter}

