const studentPermission = async function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth/login')
        return
    }

    if (req.session.user.role !== 'student') {
        res.redirect('/')
        return
    }
    next()
}

const teacherPermission = async function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth/login')
        return
    }

    if (req.session.user.role !== 'teacher') {
        res.redirect('/')
        return
    }
    next()
}

const adminPermission = async function(req, res, next) {
    if (!req.session.user) {
        res.redirect('/auth/login')
        return
    }

    if (req.session.user.role !== 'admin') {
        res.redirect('/')
        return
    }
    next()
}

const onlyAuthPermission = async function(req, res, next) {
    if (!req.session.isAuthenticated) {
        res.redirect('/auth/login')
        return
    }
    next()
}

export { studentPermission, teacherPermission, adminPermission, onlyAuthPermission }