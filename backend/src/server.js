require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectRedis } = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth');
const itensRoutes = require('./routes/itens');
const checklistsRoutes = require('./routes/checklists');
const rastreamentoRoutes = require('./routes/rastreamento');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Muitas requisições deste IP, tente novamente em um minuto' }
});
app.use('/api', limiter);

// Serve uploads
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/itens', itensRoutes);
app.use('/api/v1/checklists', checklistsRoutes);
app.use('/api/v1/rastreamento', rastreamentoRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API rodando' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno no servidor'
    });
});

const http = require('http');
const { initWebSocketServer } = require('./websocket/server');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectRedis();
        const server = http.createServer(app);
        initWebSocketServer(server); // Inicializa Socket.IO/WS attached no node server

        server.listen(PORT, () => {
            console.log(`Servidor HTTP + WSS rodando na porta ${PORT}`);
        });
    } catch (err) {
        console.error('Falha ao iniciar o servidor:', err);
        process.exit(1);
    }
};

startServer();
