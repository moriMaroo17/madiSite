import express from 'express'
import exhbs from 'express-handlebars'
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access'
import Handlebars from 'handlebars'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const PORT = 5000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

const hbs = exhbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/docs', express.static(path.join(__dirname, 'docs')))

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Главная страница'
    })
})

app.get('/add', (req, res) => {
    res.render('add', {
        title: 'Добавить задание'
    })
})

app.get('/start', (req, res) => {
    console.log(req.query)
    console.log(req.body)
    res.redirect(`task/${req.query.id}/${req.query.variant}`)
})

app.get('/task/:id/:variant', (req, res) => {
    res.render('task', {
        title: `Работа ${req.params.id}`,
        filePath: '../../file/example.pdf'
    })
})

app.get('/file/:fileName', (req, res) => {
    res.sendFile(path.join(__dirname, `docs/${req.params.fileName}`))
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

