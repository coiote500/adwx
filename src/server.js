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
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const SECRET = process.env.JWT_SECRET || 'aura_blindagem_2026_elite';

// --- 1. BLINDAGEM DE SEGURANÇA (MIDDLEWARES) ---

// Helmet para headers de segurança (CSP, HSTS, etc)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://*"],
            connectSrc: ["'self'"]
        }
    }
}));

// Proteção contra XSS no body/query/params
app.use(xss());

// Proteção contra HTTP Parameter Pollution
app.use(hpp());

app.use(compression());
app.use(morgan('combined')); // Log mais detalhado para auditoria
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10kb' })); // Limita tamanho do payload para evitar DoS
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Rate Limiting Geral
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Muitas requisições vindas deste IP, tente novamente mais tarde."
});
app.use(generalLimiter);

// Rate Limiting para Login (mais agressivo)
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Bloqueio de segurança: muitas tentativas de login. Tente em 1 hora."
});

// --- AUTH MIDDLEWARE ---
const protect = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: 'Acesso negado' });
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('admin_token');
        return res.status(401).json({ error: 'Sessão expirada' });
    }
};

// --- ROUTES ---

// Auth
app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'aura2026';
    
    if (username === adminUser && password === adminPass) {
        const token = jwt.sign({ admin: true }, SECRET, { expiresIn: '8h' });
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em Produção
            sameSite: 'Strict',
            maxAge: 8 * 60 * 60 * 1000
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
        const publicData = { ...data };
        
        // Proteção de Dados (LGPD): Só envia leads/contatos se o admin estiver logado
        const token = req.cookies.admin_token;
        let isAdmin = false;
        if (token) {
            try {
                jwt.verify(token, SECRET);
                isAdmin = true;
            } catch (err) {}
        }
        
        if (!isAdmin) {
            delete publicData.contacts; // Remove PII data para visitantes normais
        }
        
        res.json(publicData);
    } catch (err) {
        res.status(500).json({ error: 'Erro de leitura' });
    }
});

app.post('/api/content', protect, async (req, res) => {
    try {
        await fs.writeJson(DB_PATH, req.body, { spaces: 2 });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro de gravação' });
    }
});

// Contact Form - COM VALIDAÇÃO E BLINDAGEM
app.post('/api/contact', [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().escape().notEmpty(),
    body('message').trim().escape().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Dados inválidos ou perigosos detectados.' });
    }

    try {
        const { name, email, company, message } = req.body;
        const data = await fs.readJson(DB_PATH);
        data.contacts.push({
            id: Date.now(),
            date: new Date().toLocaleString('pt-BR'),
            name, email, company, message
        });
        await fs.writeJson(DB_PATH, data, { spaces: 2 });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro no servidor' });
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

// Rota de 404 Blindada
app.use((req, res) => {
    res.status(404).send('<h1>Acesso Negado ou Recurso Inexistente</h1>');
});

app.listen(PORT, () => {
    console.log(`🛡️ AURA DIGITAL BLINDADA na porta ${PORT}`);
});
