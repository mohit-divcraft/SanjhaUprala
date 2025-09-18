const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function upsertSupportTypes() {
  const data = [
    { key: 'FINANCIAL', label: 'Financial Assistance (funding, relief)' },
    { key: 'RECON', label: 'Reconstruction & Infrastructure' },
    { key: 'MEDICAL', label: 'Medical & Health Services' },
    { key: 'EDU', label: 'Education & Child Support' },
    { key: 'LIVELIHOOD', label: 'Livelihood Restoration' },
    { key: 'RELIEF', label: 'Relief & Rehabilitation' },
    { key: 'PSYCHO', label: 'Psychological Counseling & Support' },
    { key: 'OTHER', label: 'Other' }
  ]
  for (const s of data) {
    await prisma.supportType.upsert({
      where: { key: s.key },
      update: { label: s.label },
      create: { key: s.key, label: s.label }
    })
  }
}

async function upsertScales() {
  const data = [
    { key: 'FULL', label: 'Adoption of a full village' },
    { key: 'PARTIAL', label: 'Partial support for a village (specific need)' },
    { key: 'FUND', label: 'Contribution to a common fund for rehabilitation' },
    { key: 'OPEN', label: 'Undecided / open to discussion' }
  ]
  for (const s of data) {
    await prisma.scale.upsert({
      where: { key: s.key },
      update: { label: s.label },
      create: { key: s.key, label: s.label }
    })
  }
}

async function upsertNgos() {
  const data = [
    { name: 'Amritsar Relief Foundation', type: 'NGO' },
    { name: 'Punjab CSR Trust', type: 'CSR' }
  ]
  for (const n of data) {
    await prisma.nGO.upsert({
      where: { name: n.name },
      update: { type: n.type },
      create: { name: n.name, type: n.type }
    })
  }
}

async function upsertVillages() {
  // NOTE: keep names same as earlier seed
    const villages = [
    {
      name: 'Talwandi Rai Dadu',
      district: null,
      contacts: [
        { name: 'Anuj Sharma', phone: '7087777857', role: 'PATWARI' },
        { name: 'Dalbir Singh', phone: null, role: 'SARPANCH' },
        { name: 'Jagjit Singh', phone: '9855577549', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Machiwahla',
      district: null,
      contacts: [
        { name: 'Pardeep Kumar', phone: '9464226971', role: 'PATWARI' },
        { name: 'Kulwinder Kaur', phone: '9855168216', role: 'SARPANCH' },
        { name: 'Harjit Singh', phone: '9855168216', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Ghonewal',
      district: null,
      contacts: [
        { name: 'Gorav Manan', phone: '8460235211', role: 'PATWARI' },
        { name: 'Amarjit Singh', phone: '9779393024', role: 'SARPANCH' },
        { name: 'Prithvipal Singh', phone: '9814738246', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Jatta',
      district: null,
      contacts: [
        { name: 'Pardeep Kumar', phone: '9464226971', role: 'PATWARI' },
        { name: 'Harjit Kaur', phone: '9814197530', role: 'SARPANCH' },
        { name: 'Balwinder Singh', phone: '9914723920', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Pashiya',
      district: null,
      contacts: [
        { name: 'Pardeep Kumar', phone: '9464226971', role: 'PATWARI' },
        { name: 'Mehal Singh', phone: '7973902280', role: 'SARPANCH' },
        { name: 'Kulbir Singh', phone: '9465487654', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Singoke',
      district: null,
      contacts: [
        { name: 'Sarbjit Singh', phone: '7087958474', role: 'PATWARI' },
        { name: 'Mandeep Kaur', phone: '9878398573', role: 'SARPANCH' },
        { name: 'Gurmeet Singh', phone: '8725907946', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Nisoke',
      district: null,
      contacts: [
        { name: 'Pardeep Kumar', phone: '9464226971', role: 'PATWARI' },
        { name: 'Dalbir Kaur', phone: '8872233970', role: 'SARPANCH' },
        { name: 'Kuldeep Singh', phone: '9914181435', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Abadi Chandigarh',
      district: null,
      contacts: [
        { name: 'Parmjit Singh', phone: '7968828119', role: 'PATWARI' },
        { name: 'Balraj Singh', phone: '9465482616', role: 'SARPANCH' }
      ]
    },
    {
      name: 'Shehzada',
      district: null,
      contacts: [
        { name: 'Pardeep Kumar', phone: '9464226971', role: 'PATWARI' },
        { name: 'Manjit Kaur', phone: '7681958676', role: 'SARPANCH' },
        { name: 'Harbhajan Singh', phone: '9592190323', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Panj Gari Wahla',
      district: null,
      contacts: [
        { name: 'Sarbjit Singh', phone: '7087958474', role: 'PATWARI' },
        { name: 'Rajwinder Singh', phone: '9914304120', role: 'SARPANCH' },
        { name: 'Surinder Kumar', phone: '7380227436', role: 'NUMBERDAR' }
      ]
    },
    {
      name: 'Kot Gurbaskh',
      district: null,
      contacts: [
        { name: 'Pardeep Kumar', phone: '9464226971', role: 'PATWARI' },
        { name: 'Santokh Singh', phone: '8260000095', role: 'SARPANCH' },
        { name: 'Kuldip Singh', phone: '9878522358', role: 'NUMBERDAR' }
      ]
    }
  ]

  for (const v of villages) {
    // create village and its contacts
    await prisma.village.upsert({
      where: { name: v.name },
      update: {},
      create: {
        name: v.name,
        district: v.district,
        description: v.description,
        contacts: {
          create: v.contacts.map(c => ({ name: c.name, phone: c.phone, role: c.role }))
        }
      }
    })
  }
}

const bcrypt = require('bcrypt')

async function upsertAdmin() {
  const hash = await bcrypt.hash("admin123", 10) // 👈 default password
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hash,
    },
  })
}

async function main() {
  try {
    await upsertSupportTypes()
    await upsertScales()
    await upsertNgos()
    await upsertVillages()
    await upsertAdmin()
    console.log('Seeding complete')
  } catch (err) {
    console.error('Seed error', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()