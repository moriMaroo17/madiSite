export default (req, res, next) => {
    res.locals.isAuth = req.session.isAuthenticated
    if (req.session.isAuthenticated) {
        if (req.session.user.role === 'student') {
            res.locals.isStudent = true
        } else if (req.session.user.role === 'teacher') {
            res.locals.isTeacher = true
        } else if (req.session.user.role === 'admin') {
            res.locals.isAdmin = true
        }
    }
    next()
}