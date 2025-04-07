const express = require('express');
const dns = require('dns').promises;
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email validation function
async function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, reason: 'Invalid syntax' };
    }

    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        if (mxRecords.length > 0) {
            return { isValid: true, reason: 'Valid email' };
        } else {
            return { isValid: false, reason: 'No mail servers found' };
        }
    } catch (error) {
        return { isValid: false, reason: 'Invalid domain' };
    }
}

// GET /validate
app.get('/validate', async (req, res) => {
    const email = req.query.email || req.body.email;
    console.log('GET email:', email);
    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
    }
    const result = await isEmailValid(email);
    res.json(result);
});

// POST /validate
app.post('/validate', async (req, res) => {
    // console.log('req.body:', req.body);
    console.log('req.query:', req.query);
    const email = req.query.email;
    console.log('POST email:', email);
    if (!email) {
        return res.status(400).json({ error: 'Email field is required in body or query' });
    }
    const result = await isEmailValid(email);
    res.json(result);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});