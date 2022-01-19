import { Router } from 'express'
import { adminPermission } from '../middleware/permission.js'
import User from '../models/user.js'


const router = new Router()


router.get('/', adminPermission, async (req, res) => {
    try {
        const students = await User.find({role: 'student'})
        const teachers = await User.find({role: 'teacher'})
        const admins = await User.find({role: 'admin'})
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


export { router as adminRouter }