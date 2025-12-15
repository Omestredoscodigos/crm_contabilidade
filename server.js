const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Pool de Conexão MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper para parse seguro de JSON
const safeJSON = (str) => {
    try { return typeof str === 'string' ? JSON.parse(str) : str; }
    catch (e) { return []; }
};

// --- API: BUSCAR WORKSPACE ---
app.get('/api/workspace/:slug', async (req, res) => {
    const slug = req.params.slug;
    try {
        const [settings] = await pool.query('SELECT * FROM company_settings WHERE workspace_slug = ?', [slug]);
        const [users] = await pool.query('SELECT * FROM users WHERE workspace_slug = ?', [slug]);
        const [clients] = await pool.query('SELECT * FROM clients WHERE workspace_slug = ?', [slug]);
        const [tasks] = await pool.query('SELECT * FROM tasks WHERE workspace_slug = ?', [slug]);
        const [leads] = await pool.query('SELECT * FROM leads WHERE workspace_slug = ?', [slug]);
        const [pipelines] = await pool.query('SELECT * FROM pipelines WHERE workspace_slug = ?', [slug]);
        const [logs] = await pool.query('SELECT * FROM audit_logs WHERE workspace_slug = ? ORDER BY timestamp DESC LIMIT 50', [slug]);

        res.json({
            profile: settings[0] || null,
            users: users.map(u => ({ ...u, permissions: safeJSON(u.permissions_json) })),
            clients: clients.map(c => ({
                ...c,
                address: safeJSON(c.address_json),
                responsible: safeJSON(c.responsible_json),
                contract: safeJSON(c.contract_json)
            })),
            tasks: tasks.map(t => ({
                ...t,
                subtasks: safeJSON(t.subtasks_json),
                comments: safeJSON(t.comments_json),
                tags: safeJSON(t.tags_json),
                attachments: safeJSON(t.attachments_json)
            })),
            leads,
            pipelines: pipelines.map(p => ({ ...p, columns: safeJSON(p.columns_json) })),
            audit_logs: logs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: SALVAR CLIENTE ---
app.post('/api/clients', async (req, res) => {
    const c = req.body;
    try {
        const query = `REPLACE INTO clients (id, workspace_slug, name, company_name, cnpj, regime, email, phone, status, monthly_fee, address_json, responsible_json, contract_json) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [
            c.id, c.workspace_slug, c.name, c.companyName, c.cnpj, c.regime, c.email, c.phone, c.status, c.monthlyFee,
            JSON.stringify(c.address), JSON.stringify(c.responsible), JSON.stringify(c.contract)
        ]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: ATUALIZAR STATUS TAREFA ---
app.patch('/api/tasks/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Servir Frontend
app.use(express.static(path.join(__dirname, '.')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ContabilFlow CRM rodando na porta ${PORT}`));