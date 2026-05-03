require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'BPT' }));
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

app.use(notFound);
app.use(errorHandler);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`BPT disponible sur http://localhost:${port}`);
      console.log('Admin: admin@bpt.local / AdminBPT2026!');
    });
  })
  .catch((error) => {
    console.error('Erreur initialisation DB:', error);
    process.exit(1);
  });
// Servir les fichiers du frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Rediriger toutes les routes vers index.html (pour SPA ou navigation)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
