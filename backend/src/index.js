require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const multer = require('multer');

const path = require('path');
const fs = require('fs');

// ensure public/media and events folders exist (creates them if missing)
const mediaRoot = path.join(__dirname, 'public', 'media');
const eventsFolder = path.join(mediaRoot, 'events');
if (!fs.existsSync(mediaRoot)) fs.mkdirSync(mediaRoot, { recursive: true });
if (!fs.existsSync(eventsFolder)) fs.mkdirSync(eventsFolder, { recursive: true });

console.log(mediaRoot);

// serve /media -> ./public/media
app.use('/media', express.static(mediaRoot));

// optional temporary logger to confirm requests to /media (remove after debug)
app.use((req, res, next) => {
  if (req.path.startsWith('/media')) console.log('MEDIA REQ:', req.method, req.path);
  next();
});

// multer storage -> save to ./public/media/events/<timestamp>-<origname>
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'media', 'events'));
  },
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g,'-');
    cb(null, safe);
  }
});
const upload = multer({ storage });

app.get('/api/health', (req, res) => res.json({ ok: true }));

// villages route (basic)
app.get('/api/villages', async (req, res) => {
  try {
    const villages = await prisma.village.findMany({
      include: { contacts: true,ngoVillages:true }
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

// GET all house damage requirements
app.get('/api/houseDamageRequirments', async (req, res) => {
  try {
    const data = await prisma.houseDamageRequirement.findMany({
      orderBy: { village: 'asc' }
    })
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch requirements' })
  }
})

// GET all house damage requirements
app.get('/api/schoolStationeryRequirements', async (req, res) => {
  try {
    const data = await prisma.schoolStationeryRequirement.findMany({
      orderBy: { schoolName: 'asc' }
    })
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch requirements' })
  }
})

// GET /api/events  -> list all events with images
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
      include: { images: { orderBy: { order: 'asc' } } }
    });
    res.json(events);
  } catch (err) {
    console.error('GET /api/events', err);
    res.status(500).json({ error: 'internal' });
  }
});

// GET /api/events/:id -> single event with images
app.get('/api/events/:id', async (req, res) => {
  try {
    const ev = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { images: { orderBy: { order: 'asc' } } }
    });
    if (!ev) return res.status(404).json({ error: 'not found' });
    res.json(ev);
  } catch (err) {
    console.error('GET /api/events/:id', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/admin/events      -> create event (admin)
app.post('/api/admin/events', requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, images } = req.body;
    const created = await prisma.event.create({
      data: {
        title,
        description,
        date: date ? new Date(date) : null,
        location,
        images: images && images.length ? { create: images.map((im, idx) => ({
          src: im.src, thumb: im.thumb ?? im.src, caption: im.caption, order: im.order ?? idx
        })) } : undefined
      },
      include: { images: true }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/admin/events', err);
    res.status(500).json({ error: 'internal' });
  }
});

// PUT /api/admin/events/:id   -> update event (admin)
app.put('/api/admin/events/:id', requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, images } = req.body;
    // simple approach: update basic fields, replace images if provided
    const updateData = {
      title,
      description,
      date: date ? new Date(date) : null,
      location,
      updatedAt: new Date()
    };

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: updateData
    });

    if (Array.isArray(images)) {
      // remove previous images and recreate (predictable)
      await prisma.eventImage.deleteMany({ where: { eventId: req.params.id }});
      for (let i = 0; i < images.length; i++) {
        const im = images[i];
        await prisma.eventImage.create({
          data: { eventId: req.params.id, src: im.src, thumb: im.thumb ?? im.src, caption: im.caption, order: im.order ?? i }
        });
      }
    }

    const result = await prisma.event.findUnique({ where: { id: req.params.id }, include: { images: { orderBy: { order: 'asc' } } } });
    res.json(result);
  } catch (err) {
    console.error('PUT /api/admin/events/:id', err);
    res.status(500).json({ error: 'internal' });
  }
});

// DELETE /api/admin/events/:id -> delete event (admin)
app.delete('/api/admin/events/:id', requireAdmin, async (req, res) => {
  try {
    // optionally delete images (DB rows); not removing files from disk here
    await prisma.eventImage.deleteMany({ where: { eventId: req.params.id }});
    await prisma.event.delete({ where: { id: req.params.id }});
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/events/:id', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/admin/events/upload-image  (multipart form-data) -> returns { src, thumb }
// field name: 'image'
app.post('/api/admin/events/upload-image', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    // file saved to public/media/events/<filename>
    const relPath = `/media/events/${req.file.filename}`; // served by express.static above
    // If you want, create a thumbnail here (sharp) and save path as thumb. For now set thumb = relPath
    res.json({ src: relPath, thumb: relPath });
  } catch (err) {
    console.error('POST /api/admin/events/upload-image', err);
    res.status(500).json({ error: 'internal' });
  }
});


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SANJHA UPRALA backend listening on ${port}`));
