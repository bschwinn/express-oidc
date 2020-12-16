// super awesome authentication middleware
export const authenticator = (req, res, next) => {
    if (req.user) {
        return next()
    }
    console.log(`not authorized, path: ${req.path}`)
    if (req.path.startsWith('/api')) {
        return res.status(401).json({ "status" : "unauthorized" });
    }
    return res.redirect('/login');
}
