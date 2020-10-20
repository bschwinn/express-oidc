// super awesome authentication middleware
export const authenticator = (req, res, next) => {
    if (req.user) {
        return next()
    } else {
        if (req.path === '/' || req.path === '/index.html') {
            res.redirect('/login');
            return;
        }
        return res.status(401).json({ message: 'Unauthenticated' })
    }
}
