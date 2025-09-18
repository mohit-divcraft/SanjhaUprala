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

// REPLACE only the upsertVillages function in your seed.js with this block

async function upsertVillages() {
  // full list of village names you provided
  const villageNames = [
    "Chak dogra","Fatewaal","Dalla malia","Tera rajpoota","Ajnala","Ibrahimpura",
    "Riar","Sarai","Chak Phula","Chamiari","Nangal Wanjhan wala","Wanjhanwala",
    "Kamirpura","Gujjarpura","Kotli amb","Harar kalan","Bikraur","Saidpur khurd",
    "Hasham pura","Barlas","Balharwal","Bohgan","Gurala","Kotli kazia","Lakhuwal",
    "Aliwal","Sheikh bhatti","Majhi miu","Sahliwal","Saido gazi","Bal labhe darya",
    "Kamirpura (50)","Sultan mahal","Kalo mahal","Samrai","Bhandaal","Malakpur",
    "Langarpura","Daria musa","Dujowaal","Bajwa","Dahurian","Urdhan","Bhure gill",
    "Harar near Bhure gill","Ghonewala","Saharan","Gagomahal","Dial bhatti","Sammowal",
    "Anaitpura","Harrar khurd","Sudhar","Nanoke","Kuralian","Abusaid","Langomahal",
    "Dialpura","Nasar","Sarangdev","Khanwal","Granthgarh","Talwandi rai dadu",
    "Dalla Rajpootan","Bhaini gill","Gill","Dhian singh pura","Raipur kalan","Channa",
    "Bhainian","Sundar garh","Jafarkot","Kotli koka","Punga","Chak aul","Jagdev khurd",
    "Chak bala","Sahowal","Thoba","Momanpura","Kotli jamiat singh","Kasowala",
    "Arazi Kasowala","Arazi Saharan","Makowal","Jassar","Awan near ramdas","Pandori",
    "Kotli shah habib","Nangal amb","Galab","Chaharpur","Arazi darya","Darya mansoor",
    "Wadai cheema","Kotli barwala","Daddian","Sehzada baad","Budha Warsal","Pairewaal",
    "Lakhuwal","Dhangai","Suffian","Kot rajada","Arazikot rajada","Panj garai wahla",
    "Ghumrai","Singhoke","Arazi Singhoke","Phool pura","Gaggar","Kamalpura kalan",
    "Dadraa","Kamalpura khurd","Jatta","Shehzada","Mangu naru","Talab pura",
    "Nangal sohal","Katle","Rurewal","Motla","Jai Ram kot","Kotla Suraaj Lohar",
    "Kotli Khehra","Jasraur","Ghoga","Tanana","Awaan Vasau","Gulgarh","Dial Rangarh",
    "Jhunj","Nepal","Chahiya","Cheena Karam Singh","Chakk Fateh Khan","Miadi Kalan",
    "Panju Kalal","Bhalot","Dhandal","Kotli Korotana","Bhindi Saidan","Bhindi Aulakh kalan",
    "Bhindi Aulakh Khurd","Bhindi Nain","Wariyan","Toor","Kutiwal","Shahpur","Miadi khurd",
    "Kot Sidhu","Rakh Othian","Othian","Kariyal","Jastarwal","Umarpura","Kakkar","Manj",
    "Raniyan","Lodhi Gujjar","Saidpur kalan","Dugg","Tutt","Vehra","Burj","Mohleke",
    "Mandianwala","Chuchakwal","Bhagupur Uttadh","Mujjafarpur","Channa","Kotli Dausandhi",
    "Bhagupur Bet","Bhilowal Kakejei","Saurian","Talla","Tareen","Hasanpura","Kaakar",
    "Awaan Lakha Singh","Khusupura","Fatah Bhelol","Sherpur","Akbarpur","Wazir Bhullar",
    "Shero Baggah","Shero Nigah","Budda theh","Kot Mehtab","Mehmad Mandranwala","Ramdas",
    "Kot Gurbax","Machhiwala","Pashia","Nisoke"
  ]

  // mapping of village name -> patwari contact data (from the table you provided)
  // If a village should have multiple contacts (patwari + sarpanch etc.), add an array of contacts here.
  // NOTE: phone strings kept as in your provided data; normalize if you want digits-only.
  const contactsMap = {
    "Ghonewala": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Ghonewal": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" }, // cover alternate spelling
    "Mehmad Mandranwala": { name: "Paramjit Singh", phone: "79688-28119", role: "PATWARI" },
    "Kotli shah habib": { name: "Paramjit Singh", phone: "79688-28119", role: "PATWARI" },
    "Jatta": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Shehzada": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Machhiwala": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Mangu naru": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Kot Gurbax": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Pashia": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Saharan": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" }, // (bechirag)
    "Kasowala": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" }, // Kassowala variant
    "Arazi Kasowala": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Arazi Saharan": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Arazi Daria": { name: "Harwinder Singh", phone: "99141-71111", role: "PATWARI" },
    "Phool pura": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Gaggar": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Kamalpura kalan": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Dadraa": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Kamalpura khurd": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Talab pura": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Raipur kalan": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Samrai": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Dhangai": { name: "Harwinder Singh", phone: "99141-71111", role: "PATWARI" },
    "Panj garai wahla": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Ghumrai": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Singhoke": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Nangal sohal": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Katle": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Rurewal": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Bhagupur Uttadh": { name: "Paramjit Singh", phone: "79688-28119", role: "PATWARI" },
    "Gill": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Gillan": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Bhandal": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Malakpur": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Langarpura": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Dujowaal": { name: "Iqbal Singh", phone: "98783-29007", role: "PATWARI" },
    "Bajwa": { name: "Iqbal Singh", phone: "98783-29007", role: "PATWARI" },
    "Thoba": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Awan near ramdas": { name: "Paramjit Singh", phone: "79688-28119", role: "PATWARI" },
    "Pandori": { name: "Paramjit Singh", phone: "79688-28119", role: "PATWARI" },
    "Khanwal": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Granthgarh": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Talwandi rai dadu": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Dalla Rajpootan": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Jagdev khurd": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Chak bala": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Sahowal": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Balharwal": { name: "Anuj Sharma", phone: "70877-77557", role: "PATWARI" }, // note: earlier table had 'Ballarwal' typo
    "Galab": { name: "Daljit Singh", phone: "98818-70008", role: "PATWARI" },
    "Chaharpur": { name: "Daljit Singh", phone: "98818-70008", role: "PATWARI" },
    "Kamirpura near Ajnala": { name: "Jhanda Singh", phone: "70091-18038", role: "PATWARI" },
    "Nangal Amb": { name: "Daljit Singh", phone: "98818-70008", role: "PATWARI" },
    "Chak Dogra": { name: "Jaswinder Singh", phone: "98151-44435", role: "PATWARI" },
    "Chak dogra": { name: "Jaswinder Singh", phone: "98151-44435", role: "PATWARI" },
    "Tera Rajpootan": { name: "Jaswinder Singh", phone: "98151-44435", role: "PATWARI" },
    "Fatewaal": { name: "Jaswinder Singh", phone: "98151-44435", role: "PATWARI" },
    "Dalla malia": { name: "Jaswinder Singh", phone: "98151-44435", role: "PATWARI" },
    "Ibrahimpura": { name: "Jaspal Singh", phone: "88100-00028", role: "PATWARI" },
    "Gujjarpura": { name: "Jhanda Singh", phone: "70091-18038", role: "PATWARI" },
    "Punga": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Gurala": { name: "Bhupinder Kumar", phone: "98159-16986", role: "PATWARI" },
    "Aliwal": { name: "Bhupinder Kumar", phone: "98159-16986", role: "PATWARI" },
    "Nangal Wanjhan wala": { name: "Jhanda Singh", phone: "70091-18038", role: "PATWARI" },
    "Wanjhanwala": { name: "Jhanda Singh", phone: "70091-18038", role: "PATWARI" },
    "Gaggomahal": { name: "Vishal Mahajan", phone: "84271-77282", role: "PATWARI" },
    "Samowal": { name: "Surjit Singh", phone: "94631-13453", role: "PATWARI" },
    "Anaitpura": { name: "Surjit Singh", phone: "94631-13453", role: "PATWARI" },
    "Chak aul": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Bikraur": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Saidpur khurd": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Barlas": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Kotli kazia": { name: "Bhupinder Kumar", phone: "98159-16986", role: "PATWARI" },
    "Sudhar": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Nanoke": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Kuralian": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Abusaid": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Langomahal": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Sultan mahal": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Kalo mahal": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Kotli jamiat singh": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Pairewaal": { name: "Harwinder Singh", phone: "99141-71111", role: "PATWARI" },
    "Lakhuwal": { name: "Harwinder Singh", phone: "99141-71111", role: "PATWARI" },
    "Chak Phula": { name: "Jaspal Singh", phone: "88100-00028", role: "PATWARI" },
    "Kotli amb": { name: "Jhanda Singh", phone: "70091-18038", role: "PATWARI" },
    "Harar khurd": { name: "Surjit Singh", phone: "94631-13453", role: "PATWARI" },
    "Urdhan": { name: "Joban jit Singh", phone: "98724-19190", role: "PATWARI" },
    "Bhure gill": { name: "Joban jit Singh", phone: "98724-19190", role: "PATWARI" },
    "Makowal": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Jassar": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Ajnala": { name: "Jaspal Singh", phone: "88100-00028", role: "PATWARI" },
    "Riar": { name: "Jaspal Singh", phone: "88100-00028", role: "PATWARI" },
    "Sarai": { name: "Jaspal Singh", phone: "88100-00028", role: "PATWARI" },
    "Chamiari": { name: "Surjit Singh", phone: "94631-13454", role: "PATWARI" },
    "Harar Kalan": { name: "Jhanda Singh", phone: "70091-18038", role: "PATWARI" },
    "Dial Bhatti": { name: "Surjit Singh", phone: "94631-13453", role: "PATWARI" },
    "Dialpura": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Nasar": { name: "Sandeep Singh", phone: "98550-93004", role: "PATWARI" },
    "Sarangdev": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Bhaini gill": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Dhian singh pura": { name: "Anuj Sharma", phone: "70877-77857", role: "PATWARI" },
    "Channa": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Bhainian": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Sundar garh": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Jafarkot": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Kotli koka": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Hasham pura": { name: "Shaminder Singh", phone: "98148-49557", role: "PATWARI" },
    "Bohgan": { name: "Anuj Sharma", phone: "70877-77557", role: "PATWARI" }, // 'Bogan' variant
    "Lakhuwal Near Ajnala": { name: "Bhupinder Kumar", phone: "98159-16986", role: "PATWARI" },
    "Shaikh bhatti": { name: "Balwinder Singh", phone: "98158-11765", role: "PATWARI" },
    "Majhi miu": { name: "Balwinder Singh", phone: "98158-11765", role: "PATWARI" },
    "Shaliwal": { name: "Balwinder Singh", phone: "98158-11765", role: "PATWARI" },
    "Saidogaji": { name: "Balwinder Singh", phone: "98158-11765", role: "PATWARI" },
    "Bal labhe darya": { name: "Balwinder Singh", phone: "98158-11765", role: "PATWARI" },
    "Kamirpura near Ramdas": { name: "Balwinder Singh", phone: "98158-11765", role: "PATWARI" },
    "Dariya Mussa": { name: "Loveleen Singh", phone: "99760-11117", role: "PATWARI" },
    "Dujowal": { name: "Iqbal Singh", phone: "98783-29007", role: "PATWARI" },
    "Harrar Nere Bhuregil": { name: "Joban jit Singh", phone: "98724-19190", role: "PATWARI" },
    "Momanpura": { name: "Gaurav Manan", phone: "83602-35211", role: "PATWARI" },
    "Daria Mansoor": { name: "Harwinder Singh", phone: "99141-71111", role: "PATWARI" },
    "Wadai cheema": { name: "Harwinder Singh", phone: "99141-71111", role: "PATWARI" },
    "Kotli barwala": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Daddian": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Sehzada baad": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Budha Warsal": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Suffian": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Kot rajada": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Arazi Singhoke": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Ramdas": { name: "Sarbjit Singh", phone: "70879-58474", role: "PATWARI" },
    "Nisoke": { name: "Pardeep Kumar", phone: "94642-26971", role: "PATWARI" },
    "Abadi Chandigarh": { name: "Paramjit Singh", phone: "79688-28119", role: "PATWARI" }
  }

  // iterate and upsert villages
  for (const name of villageNames) {
    const contact = contactsMap[name] || null

    const createData = {
      name,
      district: null,
      description: null
    }

    if (contact) {
      createData.contacts = {
        create: [{ name: contact.name, phone: contact.phone, role: contact.role }]
      }
    }

    try {
      await prisma.village.upsert({
        where: { name },
        update: {}, // keep existing fields unchanged
        create: createData
      })
    } catch (err) {
      console.error(`Failed to upsert village "${name}":`, err)
      // continue with next village; you can change to throw if you prefer
    }
  }
}

// --- static marking helper (paste into prisma/seed.js) ---
/**
 * Mark villages as needsHelp using a static list embedded in code.
 * Edit the `needyVillageNames` array to include all names from your sheet.
 */
async function markNeedyVillagesStatic() {
  // <-- put your full list of needy village names here (strings) -->
  const needyVillageNames = [
    "Bal labhe darya",
"Daria musa",
"Ghonewala",
"Kuralia",
"Channa",
"Jafarkot",
"Mehmad Mandranwala",
"Galab",
"Dhangai",
"Kot rajada",
"Panj garai wahla",
"Ghumrai",
"Singhoke",
"Gaggar",
"Nisoke",
"Jatta",
"Mashi wala",
"Kot Gurbax",
"Pashia",
"Nangal sohal"
  ]

  if (!Array.isArray(needyVillageNames) || needyVillageNames.length === 0) {
    console.log('markNeedyVillagesStatic: no names provided in needyVillageNames array. Skipping.')
    return
  }

  console.log(`markNeedyVillagesStatic: will attempt to mark ${needyVillageNames.length} villages as needsHelp.`)

  const notMatched = []
  let updatedCount = 0

  for (const rawName of needyVillageNames) {
    const normalized = String(rawName || '').replace(/\s+/g, ' ').trim()
    if (!normalized) continue

    try {
      // 1) Try case-insensitive exact match
      const res = await prisma.village.updateMany({
        where: { name: { equals: normalized, mode: 'insensitive' } },
        data: { needsHelp: true }
      })

      if (res.count && res.count > 0) {
        updatedCount += res.count
        console.log(`Marked (exact) "${normalized}" as needsHelp (updated ${res.count}).`)
        continue
      }

      // 2) Try loose/fuzzy matching (contains or startsWith)
      const fuzzy = await prisma.village.updateMany({
        where: {
          OR: [
            { name: { contains: normalized, mode: 'insensitive' } },
            { name: { startsWith: normalized, mode: 'insensitive' } }
          ]
        },
        data: { needsHelp: true }
      })

      if (fuzzy.count && fuzzy.count > 0) {
        updatedCount += fuzzy.count
        console.log(`Marked (fuzzy) "${normalized}" as needsHelp (updated ${fuzzy.count}).`)
      } else {
        notMatched.push(normalized)
        console.warn(`No village found to match "${normalized}"`)
      }
    } catch (err) {
      console.error(`Error while marking "${normalized}":`, err.message || err)
    }
  }

  console.log(`markNeedyVillagesStatic: completed. updatedCount=${updatedCount}, notMatched=${notMatched.length}.`)
  if (notMatched.length > 0) {
    console.log('Unmatched list (first 200):')
    notMatched.slice(0, 200).forEach(n => console.log(' -', n))
  }
}


// --- static marking helper (paste into prisma/seed.js) ---
/**
 * Mark villages as worstAffected using a static list embedded in code.
 * Edit the `needyVillageNames` array to include all names from your sheet.
 */
async function markWorstAffectedStatic() {
  // <-- put your full list of needy village names here (strings) -->
  const needyVillageNames = [
    "Bal labhe darya",
"Daria musa",
"Ghonewala",
"Kuralia",
"Channa",
"Jafarkot",
"Mehmad Mandranwala",
"Galab",
"Dhangai",
"Kot rajada",
"Panj garai wahla",
"Ghumrai",
"Singhoke",
"Gaggar",
"Nisoke",
"Jatta",
"Mashi wala",
"Kot Gurbax",
"Pashia",
"Nangal sohal"
  ]

  if (!Array.isArray(needyVillageNames) || needyVillageNames.length === 0) {
    console.log('markWorstAffectedStatic: no names provided in needyVillageNames array. Skipping.')
    return
  }

  console.log(`markWorstAffectedStatic: will attempt to mark ${needyVillageNames.length} villages as mostEffected.`)

  const notMatched = []
  let updatedCount = 0

  for (const rawName of needyVillageNames) {
    const normalized = String(rawName || '').replace(/\s+/g, ' ').trim()
    if (!normalized) continue

    try {
      // 1) Try case-insensitive exact match
      const res = await prisma.village.updateMany({
        where: { name: { equals: normalized, mode: 'insensitive' } },
        data: { mostEffected: true }
      })

      if (res.count && res.count > 0) {
        updatedCount += res.count
        console.log(`Marked (exact) "${normalized}" as mostEffected (updated ${res.count}).`)
        continue
      }

      // 2) Try loose/fuzzy matching (contains or startsWith)
      const fuzzy = await prisma.village.updateMany({
        where: {
          OR: [
            { name: { contains: normalized, mode: 'insensitive' } },
            { name: { startsWith: normalized, mode: 'insensitive' } }
          ]
        },
        data: { mostEffected: true }
      })

      if (fuzzy.count && fuzzy.count > 0) {
        updatedCount += fuzzy.count
        console.log(`Marked (fuzzy) "${normalized}" as mostEffected (updated ${fuzzy.count}).`)
      } else {
        notMatched.push(normalized)
        console.warn(`No village found to match "${normalized}"`)
      }
    } catch (err) {
      console.error(`Error while marking "${normalized}":`, err.message || err)
    }
  }

  console.log(`markWorstAffectedStatic: completed. updatedCount=${updatedCount}, notMatched=${notMatched.length}.`)
  if (notMatched.length > 0) {
    console.log('Unmatched list (first 200):')
    notMatched.slice(0, 200).forEach(n => console.log(' -', n))
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
    await markNeedyVillagesStatic()
    await markWorstAffectedStatic()
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