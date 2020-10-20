import http from 'http'
import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
import expressSession from 'express-session'
import passport from 'passport'
import openIdClient from 'openid-client'
import redisStore from 'connect-redis'
import storage from './storage.js'
import {authenticator} from './armor.js'

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

const { Issuer, Strategy, custom } = openIdClient
custom.setHttpOptionsDefaults({
  timeout: 10000,
});

const openIDCIssuer = await Issuer.discover(process.env.OIDC_OAUTH_URL)
const redirectUri = process.env.OIDC_REDIRECT_URI
const client = new openIDCIssuer.Client({
  client_id: process.env.OIDC_CLIENT_ID,
  client_secret: process.env.OIDC_CLIENT_SECRET,
  redirect_uris: [`${process.env.HOST_URL}${redirectUri}`],
});

const RedisStore = redisStore(expressSession);
const seshStore = new RedisStore({ client: stats.client });

app.use(expressSession({
    cookie: {
      maxAge: 86400000,
      httpOnly: true,
      secure: false,
    },
    saveUninitialized: false,
    resave: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: seshStore,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    'oidc',
    new Strategy(
      { client, passReqToCallback: true },
      async (req, tokenSet, done) => {
        const user = tokenSet.claims()
        done(null, user)
      }
    )
)

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/oauth', (req, res, next) => {
    passport.authenticate('oidc', { logout: 'true' })(req, res, next);
});

app.get(redirectUri, (req, res, next) =>
    passport.authenticate('oidc', {
        successRedirect: '/secret/',
        failureRedirect: '/login',
    })(req, res, next)
)

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