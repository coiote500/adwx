require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs-extra');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const SECRET = process.env.JWT_SECRET || 'aura_secret_2026';

// --- MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Rate Limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
}));

// --- AUTH MIDDLEWARE ---
const protect = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: 'Não autorizado' });
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('admin_token');
        return res.status(401).json({ error: 'Sessão inválida' });
    }
};

// --- ROUTES ---

// Auth
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'aura2026';
    
    // In a real app, use bcrypt. Here we check against env for simplicity
    if (username === adminUser && password === adminPass) {
        const token = jwt.sign({ admin: true }, SECRET, { expiresIn: '1d' });
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({ success: true });
    }
    res.status(401).json({ error: 'Credenciais inválidas' });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

// Content API
app.get('/api/content', async (req, res) => {
    try {
        const data = await fs.readJson(DB_PATH);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao carregar dados' });
    }
});

app.post('/api/content', protect, async (req, res) => {
    try {
        const newContent = req.body;
        await fs.writeJson(DB_PATH, newContent, { spaces: 2 });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar dados' });
    }
});

// Contact Form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, company, message } = req.body;
        const data = await fs.readJson(DB_PATH);
        const newMsg = {
            id: Date.now(),
            date: new Date().toLocaleString('pt-BR'),
            name, email, company, message
        };
        data.contacts.push(newMsg);
        await fs.writeJson(DB_PATH, data, { spaces: 2 });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

// View Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'views', 'index.html')));
app.get('/admin', (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) return res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    try {
        jwt.verify(token, SECRET);
        res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
    } catch (err) {
        res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AURA DIGITAL Server running at http://localhost:${PORT}`);
});
