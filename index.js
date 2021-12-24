import express from 'express'
import exhbs from 'express-handlebars'
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access'
import { createRequire } from "module";
import Handlebars from 'handlebars'
import { fileURLToPath } from 'url'
import path from 'path'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload'

import { homeRouter } from './routes/home.js'
import { taskRouter } from './routes/task.js'
import { authRouter } from './routes/auth.js'
import { fileRouter } from './routes/file.js'
import { addRouter } from './routes/add.js'

const require = createRequire(import.meta.url);

const keys = require('./keys/keys.json')

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
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

app.use('/', homeRouter)
app.use('/task', taskRouter)
app.use('/auth', authRouter)
app.use('/file', fileRouter)
app.use('/add', addRouter)

function start() {
    try {
        mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()

