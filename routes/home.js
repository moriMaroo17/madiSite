import { Router } from 'express'

const router = new Router()

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Главная страница'
    })
})

export {router as homeRouter} 