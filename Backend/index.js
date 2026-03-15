// ============================================================
//  GamePlay — Payment API Server
//  Port: 3001
//  Ye server alag hai socket.io server se (port 5000)
// ============================================================

const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const app = express()

// ── CORS — dono websites ko allow karo ──────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:5173',   // Main gaming app
        'http://localhost:5174',   // Payment gateway
        'http://localhost:3000',   // Backup
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))
app.use(express.json())

// ── Database setup ───────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'payments.db'))

db.exec(`
    -- Bank accounts table
    CREATE TABLE IF NOT EXISTS bank_accounts (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        account_name TEXT    NOT NULL,
        upi_id       TEXT    NOT NULL UNIQUE,
        bank_name    TEXT    NOT NULL,
        account_no   TEXT    NOT NULL,
        ifsc_code    TEXT    NOT NULL,
        branch       TEXT    NOT NULL,
        is_active    INTEGER NOT NULL DEFAULT 1,
        daily_limit  INTEGER NOT NULL DEFAULT 100000,
        collected    INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT    DEFAULT (datetime('now'))
    );

    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
        id           TEXT    PRIMARY KEY,
        user_id      TEXT,
        amount       INTEGER NOT NULL,
        coins        INTEGER NOT NULL,
        bank_id      INTEGER NOT NULL,
        status       TEXT    NOT NULL DEFAULT 'pending',
        utr_number   TEXT,
        return_url   TEXT    NOT NULL,
        expires_at   TEXT    NOT NULL,
        created_at   TEXT    DEFAULT (datetime('now')),
        paid_at      TEXT,
        FOREIGN KEY (bank_id) REFERENCES bank_accounts(id)
    );
`)

// ── Seed bank accounts (sirf ek baar) ────────────────────────────────────────
const bankCount = db.prepare('SELECT COUNT(*) as c FROM bank_accounts').get().c
if (bankCount === 0) {
    const ins = db.prepare(`
        INSERT INTO bank_accounts (account_name, upi_id, bank_name, account_no, ifsc_code, branch)
        VALUES (?, ?, ?, ?, ?, ?)
    `)
        ;[
            ['Rahul Sharma', '7879110142@ybl', 'Axis Bank', '9201 4823 0012', 'UTIB0001234', 'Connaught Place, Delhi'],
            ['Priya Mehta', '9179289234@jio', 'HDFC Bank', '5010 8823 9910', 'HDFC0002345', 'Bandra West, Mumbai'],
            ['Vikram Singh', '7223033012@ybl', 'State Bank India', '3200 5591 4421', 'SBIN0003456', 'MG Road, Bangalore'],
            ['Anita Joshi', '9179692978@axl', 'ICICI Bank', '4123 8891 2200', 'ICIC0004567', 'Sector 18, Noida'],
            ['Rohit Verma', '9131780746@nyes', 'Yes Bank', '7812 3345 9900', 'YESB0005678', 'Anna Nagar, Chennai'],
        ].forEach(row => ins.run(...row))
    console.log('✦ 5 bank accounts seeded into DB')
}

// ── Helper: random active bank ───────────────────────────────────────────────
function pickBank() {
    const banks = db.prepare(
        'SELECT * FROM bank_accounts WHERE is_active = 1 AND collected < daily_limit'
    ).all()
    if (!banks.length) return null
    return banks[Math.floor(Math.random() * banks.length)]
}

// ── Helper: expiry time (+15 minutes) ────────────────────────────────────────
function expiresIn15() {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 15)
    return d.toISOString()
}

// ============================================================
//  ROUTES — TRANSACTIONS
// ============================================================

/**
 * POST /api/txn/create
 * Body: { amount, coins, returnUrl, userId? }
 * Returns: { txnId, expiresAt }
 *
 * Deposit.jsx is se call karta hai — transaction banata hai
 * aur txnId return karta hai jisse payment gateway open hogi
 */
app.post('/api/txn/create', (req, res) => {
    try {
        const { amount, coins, returnUrl, userId } = req.body

        if (!amount || Number(amount) < 10)
            return res.status(400).json({ error: 'Minimum deposit is ₹10' })
        if (!returnUrl)
            return res.status(400).json({ error: 'returnUrl is required' })

        const bank = pickBank()
        if (!bank)
            return res.status(503).json({ error: 'No payment accounts available. Try later.' })

        const txnId = uuidv4()
        const expiresAt = expiresIn15()

        db.prepare(`
            INSERT INTO transactions (id, user_id, amount, coins, bank_id, return_url, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(txnId, userId || null, Number(amount), Number(coins), bank.id, returnUrl, expiresAt)

        console.log(`✦ Txn created: ${txnId} | ₹${amount} | Bank: ${bank.account_name}`)

        res.json({ success: true, txnId, expiresAt })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

/**
 * GET /api/txn/:id
 * Returns full transaction + bank details
 *
 * Payment Gateway is se bank ka UPI, QR, account number fetch karta hai
 */
app.get('/api/txn/:id', (req, res) => {
    try {
        const row = db.prepare(`
            SELECT
                t.id, t.amount, t.coins, t.status, t.utr_number,
                t.expires_at, t.created_at, t.paid_at, t.return_url,
                b.account_name, b.upi_id, b.bank_name,
                b.account_no,   b.ifsc_code, b.branch
            FROM transactions t
            JOIN bank_accounts b ON t.bank_id = b.id
            WHERE t.id = ?
        `).get(req.params.id)

        if (!row) return res.status(404).json({ error: 'Transaction not found' })

        // Auto-expire check
        if (new Date() > new Date(row.expires_at) && row.status === 'pending') {
            db.prepare("UPDATE transactions SET status='expired' WHERE id=?").run(row.id)
            row.status = 'expired'
        }

        res.json(row)
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

/**
 * GET /api/txn/status/:id
 * Lightweight — sirf status return karta hai
 *
 * Payment Gateway har 4 second mein ye call karta hai (polling)
 * jab tak payment confirm na ho jaye
 */
app.get('/api/txn/status/:id', (req, res) => {
    try {
        const row = db.prepare(
            'SELECT status, paid_at, coins FROM transactions WHERE id=?'
        ).get(req.params.id)

        if (!row) return res.status(404).json({ error: 'Not found' })

        // Auto-expire
        const txn = db.prepare('SELECT expires_at FROM transactions WHERE id=?').get(req.params.id)
        if (txn && new Date() > new Date(txn.expires_at) && row.status === 'pending') {
            db.prepare("UPDATE transactions SET status='expired' WHERE id=?").run(req.params.id)
            return res.json({ status: 'expired' })
        }

        res.json({ status: row.status, paid_at: row.paid_at, coins: row.coins })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// ============================================================
//  ROUTES — PAYMENT VERIFICATION
// ============================================================

/**
 * POST /api/payment/verify
 * Body: { txnId, utrNumber }
 *
 * Jab user UTR number daale tab ye call hota hai
 * Production mein: bank API se UTR verify karo
 * Abhi: trust karo aur mark as paid
 */
app.post('/api/payment/verify', (req, res) => {
    try {
        const { txnId, utrNumber } = req.body
        if (!txnId) return res.status(400).json({ error: 'txnId required' })

        const txn = db.prepare('SELECT * FROM transactions WHERE id=?').get(txnId)
        if (!txn) return res.status(404).json({ error: 'Transaction not found' })
        if (txn.status !== 'pending') return res.json({ success: true, status: txn.status })

        db.prepare(`
            UPDATE transactions SET status='success', utr_number=?, paid_at=datetime('now')
            WHERE id=?
        `).run(utrNumber || 'MANUAL', txnId)

        db.prepare('UPDATE bank_accounts SET collected = collected + ? WHERE id=?')
            .run(txn.amount, txn.bank_id)

        console.log(`✦ Payment verified: ${txnId} | UTR: ${utrNumber}`)

        res.json({ success: true, status: 'success', coins: txn.coins, returnUrl: txn.return_url })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

/**
 * POST /api/payment/simulate   ← SIRF TESTING KE LIYE
 * Production mein ye route DELETE kar dena
 */
app.post('/api/payment/simulate', (req, res) => {
    const { txnId } = req.body
    const txn = db.prepare('SELECT * FROM transactions WHERE id=?').get(txnId)
    if (!txn) return res.status(404).json({ error: 'Not found' })
    if (txn.status !== 'pending') return res.json({ success: true, status: txn.status })

    db.prepare(`
        UPDATE transactions SET status='success', utr_number=?, paid_at=datetime('now') WHERE id=?
    `).run('SIM' + Date.now(), txnId)
    db.prepare('UPDATE bank_accounts SET collected = collected + ? WHERE id=?')
        .run(txn.amount, txn.bank_id)

    console.log(`✦ [DEMO] Payment simulated: ${txnId}`)
    res.json({ success: true })
})

// ============================================================
//  ROUTES — ADMIN (Bank management)
// ============================================================

// Sabhi banks dekho
app.get('/api/admin/banks', (_req, res) => {
    res.json(db.prepare('SELECT * FROM bank_accounts').all())
})

// Naya bank add karo
app.post('/api/admin/banks', (req, res) => {
    const { account_name, upi_id, bank_name, account_no, ifsc_code, branch, daily_limit } = req.body
    try {
        const r = db.prepare(`
            INSERT INTO bank_accounts (account_name, upi_id, bank_name, account_no, ifsc_code, branch, daily_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(account_name, upi_id, bank_name, account_no, ifsc_code, branch, daily_limit || 100000)
        res.json({ success: true, id: r.lastInsertRowid })
    } catch (err) {
        res.status(400).json({ error: 'UPI ID already exists or invalid data' })
    }
})

// Bank enable/disable toggle
app.patch('/api/admin/banks/:id/toggle', (req, res) => {
    db.prepare('UPDATE bank_accounts SET is_active = CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id=?')
        .run(req.params.id)
    res.json({ success: true })
})

// Bank delete
app.delete('/api/admin/banks/:id', (req, res) => {
    db.prepare('DELETE FROM bank_accounts WHERE id=?').run(req.params.id)
    res.json({ success: true })
})

// Recent transactions
app.get('/api/admin/transactions', (_req, res) => {
    const rows = db.prepare(`
        SELECT t.*, b.account_name, b.upi_id
        FROM transactions t JOIN bank_accounts b ON t.bank_id = b.id
        ORDER BY t.created_at DESC LIMIT 100
    `).all()
    res.json(rows)
})

// Reset daily collected (cron se call karo ya manually)
app.post('/api/admin/reset-daily', (_req, res) => {
    db.prepare('UPDATE bank_accounts SET collected = 0').run()
    res.json({ success: true, message: 'Daily limits reset' })
})

// ============================================================
//  START SERVER
// ============================================================
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('')
    console.log('╔══════════════════════════════════════╗')
    console.log('║   GamePlay Payment API — Port 3001   ║')
    console.log('╚══════════════════════════════════════╝')
    console.log('')
    console.log('  Endpoints:')
    console.log('  POST  /api/txn/create')
    console.log('  GET   /api/txn/:id')
    console.log('  GET   /api/txn/status/:id')
    console.log('  POST  /api/payment/verify')
    console.log('  POST  /api/payment/simulate  [DEMO]')
    console.log('  GET   /api/admin/banks')
    console.log('  POST  /api/admin/banks')
    console.log('')
})