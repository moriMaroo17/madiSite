import { Router } from 'express'
import { adminPermission } from '../middleware/permission.js'
import User from '../models/user.js'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { dropValidators } from '../utils/validators.js'


const router = new Router()


router.get('/', adminPermission, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
        const teachers = await User.find({ role: 'teacher' })
        const admins = await User.find({ role: 'admin' })
        res.render('admin', {
            title: 'Главная',
            students,
            teachers,
            admins
        })
    } catch (error) {
        console.error(error)
    }
})

router.get('/drop/:id', adminPermission, async (req, res) => {
    res.render('drop', {
        title: 'Восстановление пароля',
        dropError: req.flash('dropError'),
        userId: req.params.id
    })
})

router.post('/drop/:id', adminPermission, dropValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('dropError', errors.array()[0].msg)
            return res.status(422).redirect(`/admin/drop/${req.params.id}`)
        }

        const { password } = req.body
        const user = await User.findById(req.params.id)

        const hashPassword = await bcrypt.hash(password, 10)

        user.password = hashPassword
        user.reset = false
        await user.save()
        res.redirect('/admin')
    } catch (error) {
        console.log(error)
    }
})


export { router as adminRouter }