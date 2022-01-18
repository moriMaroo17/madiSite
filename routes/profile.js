import { Router } from 'express'
import User from '../models/user.js'
import Answer from '../models/answer.js'

const router = new Router()


router.get('/', async (req, res) => {
    try {
        const answers = await Answer.find({userId: req.user.id}).populate({ path: 'userId', select: ['name', 'email'] }).populate({ path: 'taskId', select: 'name' }).sort({'taskId': 1})
        for (let i = 0; i < answers.length; i++) {
            answers[i] = await answers[i].populateSubTask()
        }
        res.render('profile', {
            title: 'Профиль',
            user: req.user,
            answers
        })
    } catch (error) {
        console.error(error)
    }
})

router.post('/', async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id)
        user.email = req.body.email
        user.name = req.body.name
        await user.save()
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})


export { router as profileRouter }