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
const DOSSARDS_ASSETS_DIR = path.join(__dirname, 'assets', 'Dossards')

const SUPPORTED_DISTANCES = new Set(['5k', '7k', '10k', '12k', '15k', '18k', '21k', '30k', '42k'])

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

  // 1) Build entries from assets/Dossards with naming like: 10_yellow.png, 21-blue.png
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

  // 2) Backward compatibility: include legacy JSON designs if present
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

// Ensure data dir and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
if (!fs.existsSync(DOSSARDS_FILE)) writeJSON(DOSSARDS_FILE, [])
if (!fs.existsSync(PARTIC_FILE)) writeJSON(PARTIC_FILE, [])

// GET /api/dossards - List all dossard designs (optionally filter by distance)
app.get('/api/dossards', (req, res) => {
  const distance = normalizeDistance(req.query.distance)
  const items = readDossardsCatalog()
  if (distance) return res.json(items.filter((d) => normalizeDistance(d.distance) === distance))
  res.json(items)
})

// GET /api/participants - List all participants (optionally filter by distance)
app.get('/api/participants', (req, res) => {
  const distance = normalizeDistance(req.query.distance)
  const items = readJSON(PARTIC_FILE)
  if (distance) return res.json(items.filter((p) => normalizeDistance(p.distance) === distance))
  res.json(items)
})

// POST /api/register - Register a new participant
app.post('/api/register', (req, res) => {
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

  const participants = readJSON(PARTIC_FILE)
  const id = Date.now().toString()
  const record = {
    id,
    distance: normalizedDistance,
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
