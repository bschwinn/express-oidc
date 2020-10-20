// super awesome authentication middleware
export const authenticator = (req, res, next) => {
    if (req.user) {
        return next()
    } else {
        if (req.path.startsWith('/api')) {
            return res.status(401).json({ "status" : "unauthorized" });
        }
        res.redirect('/login');
    }
}
