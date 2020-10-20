import http from 'http'
import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
import storage from './storage.js'
import {authenticator, checkPassword} from './armor.js'

// app init
dotenv.config()
const app = express()
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
const stats = storage();

// login page
app.get('/login', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'login.html');
    console.log(`sending file: ${filePath}`);
    return res.sendFile(filePath);
});
app.post('/login', (req, res) => {
    if (checkPassword(req.body.secret)) {
        console.log('setting up session');
        res.cookie('session', req.body.secret);
        return res.redirect(`/secret`);
    }
    return res.redirect(`/login`);
});

// public tracking API
app.put('/track', (req, res) => {
    stats.logData(req.body)
    return res.sendStatus(204)
})

// private tracking data API
app.get('/api', authenticator, async (req, res) => {
    const d = await stats.getData()
    res.json(d)
});

// private static files
app.use('/secret', authenticator, express.static(path.join('private')));

// public static files
app.use(express.static(path.join('public')));

// start the server
const port = process.env.PORT || 3666;
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`server started on port ${port}`)
})