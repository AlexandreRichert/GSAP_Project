require('dotenv').config()
const express = require('express')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Serve static files from project root
const STATIC_DIR = __dirname
app.use(express.static(STATIC_DIR))

// participants : PostgreSQL si DATABASE_URL (Neon), sinon fichier local
const BUNDLED_DATA_DIR = path.join(__dirname, 'data')
const PARTICIPANTS_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
    : BUNDLED_DATA_DIR
const DOSSARDS_FILE = path.join(BUNDLED_DATA_DIR, 'dossards.json')
const PARTIC_FILE = path.join(PARTICIPANTS_DIR, 'participants.json')
const DOSSARDS_ASSETS_DIR = path.join(__dirname, 'assets', 'Dossards')

const usePostgres = Boolean(process.env.DATABASE_URL)
let pool = null

const SUPPORTED_DISTANCES = new Set(['5k', '7k', '10k', '12k', '15k', '18k', '21k', '30k', '42k'])

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return []
  }
}

function readParticipantList() {
  const data = readJSON(PARTIC_FILE)
  return Array.isArray(data) ? data : []
}

function writeJSON(file, data) {
  const json = JSON.stringify(data, null, 2)
  const dir = path.dirname(file)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const tmp = path.join(
    dir,
    `.tmp-${path.basename(file)}.${process.pid}.${Date.now()}.json`
  )
  fs.writeFileSync(tmp, json, 'utf8')
  fs.renameSync(tmp, file)
}

let participantWriteChain = Promise.resolve()

function appendParticipant(record) {
  participantWriteChain = participantWriteChain.then(() => {
    const participants = readParticipantList()
    participants.push(record)
    writeJSON(PARTIC_FILE, participants)
  })
  return participantWriteChain
}

function removeParticipantFile(id) {
  participantWriteChain = participantWriteChain.then(() => {
    const participants = readParticipantList()
    const next = participants.filter((p) => p.id !== id)
    if (next.length === participants.length) {
      const err = new Error('NOT_FOUND')
      err.code = 'NOT_FOUND'
      throw err
    }
    writeJSON(PARTIC_FILE, next)
  })
  return participantWriteChain
}

function rowToParticipant(row) {
  const ts = row.created_at
  return {
    id: row.id,
    distance: row.distance,
    dossardId: row.dossard_id,
    name: row.name,
    number: String(row.number),
    ts: ts instanceof Date ? ts.toISOString() : new Date(ts).toISOString(),
  }
}

async function initParticipantsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      distance TEXT NOT NULL,
      dossard_id TEXT NOT NULL,
      name TEXT NOT NULL,
      number TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function getStoredParticipants(distanceNorm) {
  if (usePostgres) {
    const q = distanceNorm
      ? 'SELECT * FROM participants WHERE distance = $1 ORDER BY created_at ASC'
      : 'SELECT * FROM participants ORDER BY created_at ASC'
    const params = distanceNorm ? [distanceNorm] : []
    const { rows } = await pool.query(q, params)
    return rows.map(rowToParticipant)
  }
  let items = readParticipantList()
  if (distanceNorm) {
    items = items.filter((p) => normalizeDistance(p.distance) === distanceNorm)
  }
  return items
}

async function getStoredParticipantById(id) {
  if (usePostgres) {
    const { rows } = await pool.query('SELECT * FROM participants WHERE id = $1', [id])
    if (!rows.length) return null
    return rowToParticipant(rows[0])
  }
  return readParticipantList().find((p) => p.id === id) || null
}

async function insertParticipant(record) {
  if (usePostgres) {
    await pool.query(
      `INSERT INTO participants (id, distance, dossard_id, name, number, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        record.id,
        record.distance,
        record.dossardId,
        record.name,
        String(record.number),
        record.ts,
      ]
    )
    return record
  }
  await appendParticipant(record)
  return record
}

async function deleteStoredParticipant(id) {
  if (usePostgres) {
    const r = await pool.query('DELETE FROM participants WHERE id = $1', [id])
    if (r.rowCount === 0) {
      const err = new Error('NOT_FOUND')
      err.code = 'NOT_FOUND'
      throw err
    }
    return
  }
  await removeParticipantFile(id)
}

function tokenEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const x = Buffer.from(a, 'utf8')
  const y = Buffer.from(b, 'utf8')
  if (x.length !== y.length) return false
  return crypto.timingSafeEqual(x, y)
}

function normalizeDistance(value) {
  if (value === null || value === undefined) return null
  const raw = String(value).trim().toLowerCase()
  if (!raw) return null
  const match = raw.match(/(\d+)/)
  if (!match) return null
  return `${match[1]}k`
}

function titleCaseSlug(slug) {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function readDossardsCatalog() {
  const catalog = []
  const seenIds = new Set()

  if (fs.existsSync(DOSSARDS_ASSETS_DIR)) {
    const files = fs.readdirSync(DOSSARDS_ASSETS_DIR)
    for (const file of files) {
      const match = file.match(/^(\d+)(?:[_-]([a-z0-9-]+))?\.(png|jpe?g|webp)$/i)
      if (!match) continue

      const distance = `${match[1]}k`
      if (!SUPPORTED_DISTANCES.has(distance)) continue

      const colorSlug = (match[2] || 'standard').toLowerCase()
      const id = `dossard-${distance}-${colorSlug}`
      if (seenIds.has(id)) continue
      seenIds.add(id)

      const distanceKm = match[1]
      const colorLabel = titleCaseSlug(colorSlug)

      catalog.push({
        id,
        distance,
        color: colorSlug,
        name: `${colorLabel} ${distanceKm} km`,
        image: `/assets/Dossards/${file}`,
        description: `Dossard ${distanceKm} km - ${colorLabel}`,
      })
    }
  }

  const jsonItems = readJSON(DOSSARDS_FILE)
  if (Array.isArray(jsonItems)) {
    for (const item of jsonItems) {
      if (!item || !item.id || seenIds.has(item.id)) continue
      seenIds.add(item.id)
      catalog.push(item)
    }
  }

  return catalog
}

// Ensure local data dirs (dossards + fichier participants si pas Postgres)
if (!fs.existsSync(BUNDLED_DATA_DIR)) fs.mkdirSync(BUNDLED_DATA_DIR, { recursive: true })
if (!fs.existsSync(PARTICIPANTS_DIR)) fs.mkdirSync(PARTICIPANTS_DIR, { recursive: true })
if (!fs.existsSync(DOSSARDS_FILE)) writeJSON(DOSSARDS_FILE, [])
if (!usePostgres && !fs.existsSync(PARTIC_FILE)) writeJSON(PARTIC_FILE, [])

// GET /api/dossards - List all dossard designs (optionally filter by distance)
app.get('/api/dossards', (req, res) => {
  const distance = normalizeDistance(req.query.distance)
  const items = readDossardsCatalog()
  if (distance) return res.json(items.filter((d) => normalizeDistance(d.distance) === distance))
  res.json(items)
})

// GET /api/participants
app.get('/api/participants', async (req, res) => {
  try {
    const distance = normalizeDistance(req.query.distance)
    const items = await getStoredParticipants(distance)
    res.json(items)
  } catch (err) {
    console.error('GET /api/participants', err)
    res.status(500).json({ error: 'Impossible de lire les participants' })
  }
})

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { distance, dossardId, name, number } = req.body
  const normalizedDistance = normalizeDistance(distance)
  if (!distance || !dossardId || !name || !number) {
    return res.status(400).json({ error: 'Missing fields: distance, dossardId, name, number are required' })
  }

  if (!normalizedDistance || !SUPPORTED_DISTANCES.has(normalizedDistance)) {
    return res.status(400).json({ error: 'Distance invalide' })
  }

  const dossards = readDossardsCatalog()
  const selected = dossards.find((d) => d.id === dossardId)
  if (!selected) {
    return res.status(400).json({ error: 'Dossard invalide' })
  }

  const selectedDistance = normalizeDistance(selected.distance)
  if (selectedDistance && selectedDistance !== normalizedDistance) {
    return res.status(400).json({ error: 'Ce dossard ne correspond pas a la distance choisie' })
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const record = {
    id,
    distance: normalizedDistance,
    dossardId,
    name,
    number,
    ts: new Date().toISOString(),
  }

  try {
    await insertParticipant(record)
    res.json({ success: true, record })
  } catch (err) {
    console.error('register write error', err)
    res.status(500).json({ error: "Impossible d'enregistrer l'inscription" })
  }
})

// GET /api/participant/:id
app.get('/api/participant/:id', async (req, res) => {
  try {
    const participant = await getStoredParticipantById(req.params.id)
    if (!participant) return res.status(404).json({ error: 'Participant not found' })
    res.json(participant)
  } catch (err) {
    console.error('GET /api/participant', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/participant/:id
app.delete('/api/participant/:id', async (req, res) => {
  const secret = process.env.ADMIN_DELETE_TOKEN
  if (!secret) {
    return res.status(503).json({
      error:
        'Participant delete is disabled. Set ADMIN_DELETE_TOKEN in the service variables, then redeploy.',
    })
  }
  const hdr = req.get('Authorization') || ''
  const m = hdr.match(/^Bearer\s+(.+)$/i)
  const token = m ? m[1].trim() : ''
  if (!tokenEquals(token, secret)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    await deleteStoredParticipant(req.params.id)
    res.json({ success: true, removed: req.params.id })
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Participant not found' })
    }
    console.error('delete participant error', err)
    res.status(500).json({ error: 'Write error' })
  }
})

// Health check
app.get('/api/health', async (req, res) => {
  if (usePostgres && pool) {
    try {
      await pool.query('SELECT 1')
      return res.json({ ok: true, storage: 'postgres' })
    } catch (e) {
      return res.status(503).json({ ok: false, storage: 'postgres', error: 'db_unreachable' })
    }
  }
  res.json({ ok: true, storage: 'file' })
})

// Fallback for single-page navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  const filePath = path.join(STATIC_DIR, req.path)
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath)
  }
  res.sendFile(path.join(STATIC_DIR, 'index.html'))
})

;(async () => {
  if (usePostgres) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        connectionTimeoutMillis: 15000,
      })
      await initParticipantsTable()
    } catch (e) {
      console.error('PostgreSQL init failed:', e.message)
      process.exit(1)
    }
  }

  app.listen(PORT, () => {
    console.log(`🏃 Course des Copains API running at http://localhost:${PORT}`)
    if (usePostgres) {
      console.log('   Inscriptions : PostgreSQL (DATABASE_URL)')
    } else {
      console.log(`   Inscriptions : fichier ${PARTIC_FILE}`)
    }
  })
})()
