import { Router } from 'express'

const router = new Router()

router.get('/:fileName', (req, res) => {
    res.sendFile(path.join(__dirname, `docs/${req.params.fileName}`))
})


export {router as fileRouter}