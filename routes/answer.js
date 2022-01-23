import { Router } from 'express'

import Answer from '../models/answer.js'
import { studentPermission } from '../middleware/permission.js'

const router = new Router()


router.post('/', studentPermission, async (req, res) => {
    try {
        if (req.body.answerId) {
            const answer = await Answer.findById(req.body.answerId)
            answer.answer = req.body.answer
            await answer.save()
            res.redirect(`/task/${req.body.taskId}/${req.body.variantNumber}`)
        } else {
            const answer = new Answer({
                userId: req.session.user._id,
                taskId: req.body.taskId,
                variant: Number(req.body.variantNumber),
                subTaskId: req.body.subTaskId,
                answer: req.body.answer
            })
            await answer.save()
            res.redirect(`/task/${req.body.taskId}/${req.body.variantNumber}`)
        }
    } catch (error) {
        console.error(error)
    }
})

export { router as answerRouter }