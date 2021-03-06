import { Router } from 'express'
import User from '../models/user.js'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import Answer from '../models/answer.js'
import { onlyAuthPermission } from '../middleware/permission.js'
import { changeValidators, profileValidators } from '../utils/validators.js'

const router = new Router()


router.get('/', onlyAuthPermission, async (req, res) => {
    try {
        const answers = await Answer.find({ userId: req.user.id }).populate({ path: 'userId', select: ['name', 'email'] }).populate({ path: 'ask' }).sort({'taskId': 1})
        for (let i = 0; i < answers.length; i++) {
            answers[i] = await answers[i].populateAllTaskFields()
            console.log(answers[i])
        }
        res.render('profile', {
            title: 'Профиль',
            user: req.user,
            answers,
            profileError: req.flash('profileError'),
        })
    } catch (error) {
        console.error(error)
    }
})

router.post('/', onlyAuthPermission, profileValidators, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('profileError', errors.array()[0].msg)
            return res.status(422).redirect('/profile')
        }

        user.email = req.body.email
        user.name = req.body.name
        await user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})

router.get('/changePassword', onlyAuthPermission, (req, res) => {
    res.render('changePassword', {
        title: 'Смена пароля',
        changeError: req.flash('changeError')
    })
})

router.post('/changePassword', onlyAuthPermission, changeValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('changeError', errors.array()[0].msg)
            return res.status(422).redirect('/profile/changePassword')
        }

        const { newPassword } = req.body

        const user = await User.findOne(req.session.user._id)
        console.log(req.session)
        console.log(user)

        const hashPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashPassword
        await user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})

export { router as profileRouter }