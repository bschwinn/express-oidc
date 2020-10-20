const superSweetPasswords = ["bluenoyellow", "12345", "noneshallpass", "prettyplease"];

export const checkPassword = (pwd) => {
    return superSweetPasswords.includes(pwd);
}
// super awesome authentication middleware
export const authenticator = (req, res, next) => {
    const cook = req.cookies.session;
    if (checkPassword(cook)) {
        return next()
    }
    console.log(`not authorized, path: ${req.path}`)
    if (req.path.startsWith('/api')) {
        return res.status(401).json({ "status" : "unauthorized" });
    }
    return res.redirect('/login');
}
