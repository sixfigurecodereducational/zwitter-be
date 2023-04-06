import { createZweet, deleteZweet, getAllZweets, getZweetsByUser} from './database.js';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';
import createAPI from 'lambda-api';

const app = createAPI();

app.use((req, res, next) => {
    res.cors({
      headers:
        "Content-Type, Authorization, Content-Length, X-Requested-With",
    });
    next();
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader != null) {
        const token = authHeader.split(' ')[1];
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            req.user = payload;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).send('Invalid Authorization Token')
        }

    } else {
        res.status(401).send('Authorization header not found');
    }
}

app.get(
    '/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/zweets', verifyToken, async(req, res) => {
    const userId = req.query.id;
    if (userId != null) {
        const zweets = await getZweetsByUser(userId);
        res.json(zweets);
    } else {
        const zweets = await getAllZweets();
        res.json(zweets);
    }
});

app.post('/zweets', verifyToken, async(req, res) => {
    const content = req.body.content;
    const userId = req.user.email;

    if(!content || !userId) {
        return res.status(400).send('All fields are required');
    }

    await createZweet(content, userId);

    return res.status(201).send('Zweet submitted successfully');
});

app.delete('/zweets/:id', verifyToken, async(req, res) => {
    await deleteZweet(req.params.id, req.user.email);

    return res.status(200).send('Zweet deleted successfully');
});

export default app;