const studentPermission = async function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth/login')
    }

    if (req.session.user.role !== 'student') {
        res.redirect('/')
    }
    next()
}

const teacherPermission = async function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth/login')
    }

    if (req.session.user.role !== 'teacher') {
        res.redirect('/')
    }
    next()
}

const adminPermission = async function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth/login')
    }

    if (req.session.user.role !== 'admin') {
        res.redirect('/')
    }
    next()
}

export { studentPermission, teacherPermission, adminPermission}