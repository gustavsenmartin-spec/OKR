import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import handler from './api/check-initiative.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/check-initiative', async (req, res) => {
    // Provide a mocked req/res object mimicking Vercel's standard Node wrapper
    const vercelReq = {
        method: req.method,
        body: req.body,
        query: req.query,
        headers: req.headers
    };

    const vercelRes = {
        status: (code) => {
            res.status(code);
            return vercelRes;
        },
        json: (data) => {
            res.json(data);
            return vercelRes;
        },
        send: (text) => {
            res.send(text);
            return vercelRes;
        }
    };

    try {
        await handler(vercelReq, vercelRes);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock Vercel API Server running on port ${PORT}`);
});
