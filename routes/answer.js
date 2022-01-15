import { Router } from 'express'

import Answer from '../models/answer.js'

const router = new Router()


router.post('/', async (req, res) => {
    try {
        console.log(req.user)
        console.log(req.session)
        const answer = new Answer({
            userId: req.session.user._id,
            taskId: req.body.taskId,
            variant: Number(req.body.variantNumber),
            subTaskId: req.body.subTaskId,
            answer: req.body.answer
        })
        await answer.save()
        res.redirect(`/task/${req.body.taskId}/${req.body.variantNumber}`)
    } catch (error) {
        console.error(error)
    }
})

export { router as answerRouter }