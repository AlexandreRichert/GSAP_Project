const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Serve static files from project root
const STATIC_DIR = __dirname
app.use(express.static(STATIC_DIR))

// Data files in /data folder
const DATA_DIR = path.join(__dirname, 'data')
const DOSSARDS_FILE = path.join(DATA_DIR, 'dossards.json')
const PARTIC_FILE = path.join(DATA_DIR, 'participants.json')

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return []
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// Ensure data dir and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
if (!fs.existsSync(DOSSARDS_FILE)) writeJSON(DOSSARDS_FILE, [])
if (!fs.existsSync(PARTIC_FILE)) writeJSON(PARTIC_FILE, [])

// GET /api/dossards - List all dossard designs (optionally filter by distance)
app.get('/api/dossards', (req, res) => {
  const distance = req.query.distance
  const items = readJSON(DOSSARDS_FILE)
  if (distance) return res.json(items.filter((d) => String(d.distance) === String(distance)))
  res.json(items)
})

// GET /api/participants - List all participants (optionally filter by distance)
app.get('/api/participants', (req, res) => {
  const distance = req.query.distance
  const items = readJSON(PARTIC_FILE)
  if (distance) return res.json(items.filter((p) => String(p.distance) === String(distance)))
  res.json(items)
})

// POST /api/register - Register a new participant
app.post('/api/register', (req, res) => {
  const { distance, dossardId, name, number } = req.body
  if (!distance || !dossardId || !name || !number) {
    return res.status(400).json({ error: 'Missing fields: distance, dossardId, name, number are required' })
  }

  const participants = readJSON(PARTIC_FILE)
  const id = Date.now().toString()
  const record = {
    id,
    distance,
    dossardId,
    name,
    number,
    ts: new Date().toISOString(),
  }
  participants.push(record)
  writeJSON(PARTIC_FILE, participants)
  res.json({ success: true, record })
})

// GET /api/participant/:id - Get a specific participant
app.get('/api/participant/:id', (req, res) => {
  const participants = readJSON(PARTIC_FILE)
  const participant = participants.find((p) => p.id === req.params.id)
  if (!participant) return res.status(404).json({ error: 'Participant not found' })
  res.json(participant)
})

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Fallback for single-page navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  // Try serving the requested file, fallback to index.html
  const filePath = path.join(STATIC_DIR, req.path)
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath)
  }
  res.sendFile(path.join(STATIC_DIR, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🏃 Course des Copains API running at http://localhost:${PORT}`)
})
