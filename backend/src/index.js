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

// -----------------------------
// NGOs (public + admin)
// -----------------------------

// GET /api/ngos/:id -> single NGO
app.get('/api/ngos/:id', async (req, res) => {
  try {
    const row = await prisma.nGO.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (err) {
    console.error('GET /api/ngos/:id', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/admin/ngos -> create NGO
app.post('/api/admin/ngos', requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const created = await prisma.nGO.create({
      data: {
        name,
        type: type ?? null,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/admin/ngos', err);
    if (err.code === 'P2002') {
      // unique constraint on name
      return res.status(409).json({ error: 'ngo name already exists' });
    }
    res.status(500).json({ error: 'internal' });
  }
});

// PUT /api/admin/ngos/:id -> update NGO
app.put('/api/admin/ngos/:id', requireAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    const updated = await prisma.nGO.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(type !== undefined ? { type: type ?? null } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/admin/ngos/:id', err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'ngo name already exists' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'internal' });
  }
});

// DELETE /api/admin/ngos/:id -> delete NGO
app.delete('/api/admin/ngos/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.nGO.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/ngos/:id', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'internal' });
  }
});


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

// -----------------------------
// VILLAGES CRUD
// -----------------------------

// GET /api/villages  -> list all villages (optional search by ?q=)
app.get('/api/villages', async (req, res) => {
  try {
    const { q } = req.query;
    const villages = await prisma.village.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { district: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          }
        : undefined,
      include: { contacts: true, ngoVillages: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(villages);
  } catch (err) {
    console.error('GET /api/villages', err);
    res.status(500).json({ error: 'internal' });
  }
});

// GET /api/villages/:id -> single village (with contacts + ngoVillages)
app.get('/api/villages/:id', async (req, res) => {
  try {
    const row = await prisma.village.findUnique({
      where: { id: req.params.id },
      include: { contacts: true, ngoVillages: true }
    });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (err) {
    console.error('GET /api/villages/:id', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/villages -> create village
app.post('/api/villages', async (req, res) => {
  try {
    const { name, district, description, mostEffected, needsHelp } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const created = await prisma.village.create({
      data: {
        name,
        district: district ?? null,
        description: description ?? null,
        mostEffected: !!mostEffected,
        needsHelp: !!needsHelp
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/villages', err);
    if (err.code === 'P2002') {
      // unique constraint on name
      return res.status(409).json({ error: 'village name already exists' });
    }
    res.status(500).json({ error: 'internal' });
  }
});

// PUT /api/villages/:id -> update village
app.put('/api/villages/:id', async (req, res) => {
  try {
    const { name, district, description, mostEffected, needsHelp } = req.body;
    const updated = await prisma.village.update({
      where: { id: req.params.id },
      data: {
        // only set fields if provided; otherwise leave as-is
        ...(name !== undefined ? { name } : {}),
        ...(district !== undefined ? { district } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(mostEffected !== undefined ? { mostEffected: !!mostEffected } : {}),
        ...(needsHelp !== undefined ? { needsHelp: !!needsHelp } : {})
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/villages/:id', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'village name already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'not found' });
    }
    res.status(500).json({ error: 'internal' });
  }
});

// DELETE /api/villages/:id -> delete village
app.delete('/api/villages/:id', async (req, res) => {
  try {
    await prisma.village.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/villages/:id', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'internal' });
  }
});

// GET /api/villages/:id/contacts -> list contacts of a village
app.get('/api/villages/:id/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { villageId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (err) {
    console.error('GET /api/villages/:id/contacts', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/villages/:id/contacts -> create contact under a village
app.post('/api/villages/:id/contacts', async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required' });
    }
    // will throw if villageId invalid
    const created = await prisma.contact.create({
      data: {
        name,
        phone: phone ?? null,
        role, // must be one of ContactRole enum
        villageId: req.params.id
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/villages/:id/contacts', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'invalid villageId' });
    }
    res.status(500).json({ error: 'internal' });
  }
});


// -----------------------------
// CONTACTS CRUD
// -----------------------------

// GET /api/contacts -> list contacts (optional search by ?q= & ?role=)
app.get('/api/contacts', async (req, res) => {
  try {
    const { q, role } = req.query;
    const contacts = await prisma.contact.findMany({
      where: {
        AND: [
          role ? { role: role } : {},
          q
            ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { phone: { contains: q, mode: 'insensitive' } }
                ]
              }
            : {}
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { village: true }
    });
    res.json(contacts);
  } catch (err) {
    console.error('GET /api/contacts', err);
    res.status(500).json({ error: 'internal' });
  }
});

// GET /api/contacts/:id -> single contact
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const row = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: { village: true }
    });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (err) {
    console.error('GET /api/contacts/:id', err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/contacts -> create contact (supply villageId)
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, role, villageId } = req.body;
    if (!name || !role || !villageId) {
      return res.status(400).json({ error: 'name, role, villageId are required' });
    }
    const created = await prisma.contact.create({
      data: {
        name,
        phone: phone ?? null,
        role,
        villageId
      }
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/contacts', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'invalid villageId' });
    }
    res.status(500).json({ error: 'internal' });
  }
});

// PUT /api/contacts/:id -> update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, phone, role, villageId } = req.body;
    const updated = await prisma.contact.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(villageId !== undefined ? { villageId } : {})
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/contacts/:id', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'invalid villageId' });
    res.status(500).json({ error: 'internal' });
  }
});

// DELETE /api/contacts/:id -> delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/contacts/:id', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'internal' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SANJHA UPRALA backend listening on ${port}`));
