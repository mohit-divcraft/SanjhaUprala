require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// villages route (basic)
app.get('/api/villages', async (req, res) => {
  try {
    const villages = await prisma.village.findMany({
      include: { contacts: true }
    })
    res.json(villages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// create village (for admin/dev)
app.post('/api/villages', async (req, res) => {
  try {
    const data = req.body;
    const v = await prisma.village.create({ data });
    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// GET support types
app.get('/api/support-types', async (req, res) => {
  try {
    const rows = await prisma.supportType.findMany({ orderBy: { createdAt: 'asc' } })
    res.json(rows)
  } catch (err) {
    console.error('GET /api/support-types', err)
    res.status(500).json({ error: 'internal' })
  }
})

// GET scales
app.get('/api/scales', async (req, res) => {
  try {
    const rows = await prisma.scale.findMany({ orderBy: { createdAt: 'asc' } })
    res.json(rows)
  } catch (err) {
    console.error('GET /api/scales', err)
    res.status(500).json({ error: 'internal' })
  }
})

// GET NGOs
app.get('/api/ngos', async (req, res) => {
  try {
    const rows = await prisma.nGO.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(rows)
  } catch (err) {
    console.error('GET /api/ngos', err)
    res.status(500).json({ error: 'internal' })
  }
})

// POST create NGO
app.post('/api/ngos', async (req, res) => {
  try {
    const { name, type } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })
    const created = await prisma.nGO.create({ data: { name, type } })
    res.status(201).json(created)
  } catch (err) {
    console.error('POST /api/ngos', err)
    res.status(500).json({ error: 'internal' })
  }
})

// POST NGO request
app.post('/api/ngo-requests', async (req, res) => {
  try {
    const {
      ngoId, ngoName, ngoType,
      contactPerson, designation, contactPhone,
      supportTypeId, scaleId, villageId, remarks
    } = req.body

    if (!contactPerson || !contactPhone || !supportTypeId || !scaleId || !villageId) {
      return res.status(400).json({ error: 'missing required fields' })
    }

    // if ngoId provided, ensure it exists
    let connectNgo = {}
    if (ngoId) {
      const exists = await prisma.nGO.findUnique({ where: { id: ngoId } })
      if (!exists) return res.status(400).json({ error: 'ngoId not found' })
      connectNgo = { ngoId: ngoId }
    } else if (ngoName) {
      // create NGO inline
      const newNgo = await prisma.nGO.create({ data: { name: ngoName, type: ngoType } })
      connectNgo = { ngoId: newNgo.id }
    }

    const created = await prisma.nGORequest.create({
      data: {
        ...connectNgo,
        ngoName: ngoName ?? undefined,
        ngoType: ngoType ?? undefined,
        contactPerson,
        designation,
        contactPhone,
        supportTypeId,
        scaleId,
        villageId,
        remarks
      }
    })

    res.status(201).json({ id: created.id, status: created.status })
  } catch (err) {
    console.error('POST /api/ngo-requests', err)
    res.status(500).json({ error: 'internal' })
  }
})

const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || "supersecretkey" // put in .env

// login route
app.post('/api/admin/login', async (req, res) => {
  console.log("start login")
  
  const { username, password } = req.body
  const user = await prisma.adminUser.findUnique({ where: { username } })


  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  console.log(user)

  const valid = await require('bcrypt').compare(password, user.password)
  if (!valid) return res.status(401).json({ error: "Invalid credentials" })

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// middleware
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: "No token" })
  try {
    const token = auth.split(" ")[1]
    req.admin = jwt.verify(token, SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

// GET single request (admin only)
app.get('/api/admin/requests/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const row = await prisma.nGORequest.findUnique({
      where: { id },
      include: { ngo: true, village: true, supportType: true, scale: true }
    })
    if (!row) return res.status(404).json({ error: 'not found' })
    res.json(row)
  } catch (err) {
    console.error('GET /api/admin/requests/:id', err)
    res.status(500).json({ error: 'internal' })
  }
})

// approve handler snippet (replace your existing transaction)
app.post('/api/admin/requests/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params

  try {
    // load the request
    const request = await prisma.nGORequest.findUnique({
      where: { id },
      select: {  id: true,
        ngoId: true,
        villageId: true,
        status: true,
        contactPerson: true,
        designation: true,
        contactPhone: true,
        supportTypeId: true,
        scaleId: true,
        remarks: true }
    })
    if (!request) return res.status(404).json({ error: 'Request not found' })
    if (request.status === 'APPROVED') {
      return res.status(200).json({ message: 'Already approved' })
    }
    if (!request.ngoId) {
      return res.status(400).json({ error: 'Request has no linked NGO' })
    }

    // inside POST /api/admin/requests/:id/approve
const result = await prisma.$transaction(async (tx) => {
  const updatedReq = await tx.nGORequest.update({
    where: { id },
    data: { status: 'APPROVED' }
  })

  // find if assignment already exists
  const existing = await tx.ngoVillage.findFirst({
    where: { ngoId: request.ngoId, villageId: request.villageId }
  })

  let assignment = existing
  if (!existing) {
    assignment = await tx.ngoVillage.create({
      data: {
        ngoId: request.ngoId,
        villageId: request.villageId,
        requestId: request.id,
        // COPY the fields from request into the assignment
        contactPerson: request.contactPerson,
        designation: request.designation,
        contactPhone: request.contactPhone,
        supportTypeId: request.supportTypeId || undefined,
        scaleId: request.scaleId || undefined,
        remarks: request.remarks || undefined
      }
    })
  }

  return { updatedReq, assignment }
})


    res.json({ id: result.updatedReq.id, status: result.updatedReq.status, assignmentId: result.assignment.id })
  } catch (err) {
    console.error('approve error', err)
    res.status(500).json({ error: 'internal' })
  }
})



app.post('/api/admin/requests/:id/reject', requireAdmin, async (req, res) => {
  const { id } = req.params
  const updated = await prisma.nGORequest.update({
    where: { id },
    data: { status: "REJECTED" }
  })
  res.json(updated)
})

// list all NGO requests
app.get('/api/admin/requests', requireAdmin, async (req, res) => {
  const requests = await prisma.nGORequest.findMany({
    include: { ngo: true, village: true, supportType: true, scale: true }
  })
  res.json(requests)
})

app.get('/api/admin/assignments', requireAdmin, async (req, res) => {
  try {
    const rows = await prisma.ngoVillage.findMany({
      include: { ngo: true, village: true, request: true, supportType: true, scale: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

app.get('/api/villages/:id/assignments', async (req, res) => {
  try {
    const rows = await prisma.ngoVillage.findMany({
      where: { villageId: req.params.id },
      include: { ngo: true, supportType: true, scale: true }
    })
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})




const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SANJHA UPRALA backend listening on ${port}`));
