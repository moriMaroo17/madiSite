import { Router } from 'express'
import path from 'path'

const router = new Router()

// router.get('/:fileName', (req, res) => {
//     res.sendFile(path.join(__dirname, `${req.params.fileName}`))
// })


export {router as fileRouter}