import { Router } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import User from '../models/user.js'
import { registerValidators, loginValidators, resetValidators } from '../utils/validators.js'


const router = new Router()


router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Вход',
        loginError: req.flash('loginError')
    })
})

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Регистрация',
        registerError: req.flash('registerError')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login')
        }

        req.session.user = await User.findOne({ email: req.body.email })
        req.session.isAuthenticated = true
        req.session.save(err => {
            if (err) {
                throw err
            }
            if (req.session.user.role === 'admin') {
                res.redirect('/admin')
            } else {
                res.redirect('/')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/register')
        }

        const hashPassword = await bcrypt.hash(password, 10)

        if (req.session.user.role === 'admin') {
            const user = new User({
                email,
                name,
                password: hashPassword,
                role: req.body.role
            })
            await user.save()
            res.redirect('/admin')
        } else {
            const user = new User({
                email,
                name,
                password: hashPassword,
            })
            await user.save()
            res.redirect('/auth/login')
        }
    } catch (error) {
        console.log(error)
    }    
})

router.get('/reset', async (req, res) => {
    res.render('reset', {
        title: 'Сброс пароля',
        resetError: req.flash('resetError')
    })
})

router.post('/reset', resetValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        // console.log(errors.array()[0].msg)
        if (!errors.isEmpty()) {
            req.flash('resetError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/reset')
        }
        const user = await User.findOne({email: req.body.email, name: req.body.name})
        user.reset = true
        console.log(user)
        await user.save()
        res.redirect('/auth/login')
    } catch (error) {
        console.log(error)
    }
})

export { router as authRouter }