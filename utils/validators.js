import bcrypt from 'bcryptjs'
import { body } from 'express-validator'
import User from '../models/user.js'


const registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (error) {
                console.log(error)
            }
        })
        .normalizeEmail(),
    body('password', 'Введите пароль длинной 6-56 символов из латинских букв и цифр')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли должны совпадать')
            }
            return true
        })
        .trim(),
    body('name').isLength({ min: 3 }).withMessage('Имя должно быть минимум 3 символа')
        .trim()
]

const loginValidators = [
    body('email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (!user) {
                    return Promise.reject('Такого пользователя не существует')
                }
            } catch (error) {
                console.log(error)
            }
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: req.body.email })
                if (user) {
                    const areSame = await bcrypt.compare(value, user.password)
                    if (!areSame) {
                        return Promise.reject('Неверный пароль')
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })
]

export { registerValidators, loginValidators }