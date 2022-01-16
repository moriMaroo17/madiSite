import express from 'express'
import exhbs from 'express-handlebars'
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access'
import { createRequire } from "module";
import Handlebars from 'handlebars'
import { fileURLToPath } from 'url'
import path from 'path'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload'
import flash from 'connect-flash'
import session from 'express-session'
import ConnectMongoDBSession from 'connect-mongodb-session'
const MongoStore = ConnectMongoDBSession(session)

import userMiddleware from './middleware/user.js'
import varMiddleware from './middleware/variables.js'

import { homeRouter } from './routes/home.js'
import { taskRouter } from './routes/task.js'
import { authRouter } from './routes/auth.js'
import { answerRouter } from './routes/answer.js'
import { addRouter } from './routes/add.js'
import { journalRouter } from './routes/journal.js'

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

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/docs', express.static(path.join(__dirname, 'docs')))
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(flash())

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))

app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRouter)
app.use('/task', taskRouter)
app.use('/auth', authRouter)
app.use('/answer', answerRouter)
app.use('/add', addRouter)
app.use('/journal', journalRouter)

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

