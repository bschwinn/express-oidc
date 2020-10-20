// super awesome authentication middleware
export const authenticator = (req, res, next) => {
    if (req.user) {
        return next()
    } else {
        return res
            .set('Content-Type', 'application/json')
            .status(401)
            .json({ message: 'Unauthenticated' })
    }
}
