import { Pool } from 'pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fixGiftCity() {
  console.log('Fixing flat-gift-city-gandhinagar content in PostgreSQL database...');

  const cleanContent = `# Flat for Sale in GIFT City, Gandhinagar

GIFT City (Gujarat International Finance Tec-City) is India's first operational smart city and International Financial Services Centre (IFSC). Located strategically between Ahmedabad and Gandhinagar, it has evolved into one of Gujarat's most prestigious residential and business destinations. The city combines world-class infrastructure, smart urban planning, global business opportunities, and premium residential developments, making it highly attractive for professionals, entrepreneurs, NRIs, and investors.

Whether you're looking for a compact 1 BHK, a spacious 2 BHK or 3 BHK apartment, or a luxury penthouse, GIFT City offers residential options that combine modern living with long-term investment potential.

---

## Why Buy a Flat in GIFT City?

GIFT City is more than a residential address—it's an integrated smart city built around financial services, technology, and sustainable urban development.

### Key Advantages
- India's first operational Smart Financial City
- International Financial Services Centre (IFSC)
- Premium residential environment
- Smart city infrastructure & underground utility tunnels
- Excellent road & metro connectivity
- Growing corporate employment opportunities
- Modern commercial ecosystem & IFSC campus
- High rental demand & excellent appreciation potential

With global companies, financial institutions, fintech hubs, and IT firms establishing operations in GIFT City, demand for quality residential housing continues to grow rapidly.

---

## Ready-to-Move Flats in GIFT City

Ready-to-move apartments are ideal for buyers who want immediate possession without construction delays.

### Benefits
- Immediate possession & no waiting period
- Physical inspection before purchase
- Faster home loan processing
- Immediate rental income
- Established residential communities & existing amenities

Ready homes are especially popular among corporate executives and expatriates relocating to GIFT City for work.

---

## New Residential Projects

Several reputed developers are launching premium residential towers in GIFT City.

### Advantages
- Contemporary architecture & smart layouts
- Energy-efficient green building designs
- Smart home provisions & automated access
- Flexible payment plans & high resale potential

Current developments include luxury high-rise projects with 1 BHK, 2 BHK, 3 BHK, 4 BHK, duplex, and penthouse options.

---

## Luxury Apartments in GIFT City

Luxury apartments in GIFT City provide international-standard living with premium specifications.

### Premium Amenities
- Grand Clubhouse & Infinity Swimming Pool
- Fully Equipped Gym & Business Lounge
- Co-working Spaces & Yoga Deck
- Indoor Games & Landscaped Gardens
- Smart Home Automation & Video Door Phones
- Multi-Level Parking & High-Speed Elevators
- EV Charging Stations & 24×7 Security with CCTV

These residences are designed for executives, entrepreneurs, global professionals, and families seeking a premium lifestyle.

---

## Smart Home Features & Sustainable Living

GIFT City emphasizes technology-driven living and environmental sustainability:
- Smart Tech: Digital Door Locks, App-Based Controls, Voice Assistant Integration, Smart Lighting & Intelligent Parking.
- Green Features: Rainwater Harvesting, Solar Power for Common Areas, Water Recycling Systems, LED Lighting & Eco-Friendly Building Materials.

---

## Best Areas Near GIFT City

- Kudasan: A popular residential locality with apartments, shopping centres, and easy connectivity to GIFT City.
- Raysan: Known for peaceful surroundings, modern societies, and premium housing.
- Randesan: Offers residential developments suitable for professionals working in GIFT City.
- Sargasan: A rapidly growing residential neighbourhood with schools, hospitals, and retail facilities.
- Koba: Provides quick access to both Ahmedabad and Gandhinagar while remaining close to GIFT City.

---

## Property Price Trends in GIFT City

GIFT City has emerged as one of Gujarat's fastest-growing premium residential markets. Market data indicates average residential prices range around ₹10,000 to ₹12,000 per sq. ft., with premium high-rise towers commanding higher rates based on location and luxury amenities.

### Approximate Property Prices

| Property Type | Typical Price Range |
| --- | --- |
| 1 BHK / Studio Flat | ₹45 Lakhs – ₹70 Lakhs |
| 2 BHK Apartment | ₹75 Lakhs – ₹1.20 Crore |
| 3 BHK Luxury Flat | ₹1.25 Crore – ₹2.20 Crore |
| 4 BHK / Penthouse | ₹2.50 Crore – ₹5.00 Crore+ |

---

## Home Loan Guide

Purchasing a flat becomes easier with the right home loan from banks or housing finance companies.

### Required Documents
- Aadhaar Card & PAN Card
- Passport-size Photographs
- Address Proof & Income Proof (Salary Slips / ITR)
- 6-Month Bank Statements
- Property Title Documents & Approved Layout Plans

---

## Legal Verification & RERA Checklist

Before purchasing any apartment in GIFT City, verify:
- Sale Deed & Title Search Report
- Encumbrance Certificate & Property Tax Receipts
- Approved Building Plan & Occupancy Certificate (OC)
- RERA Project Registration Number & Developer Compliance

---

## NRI Investment Guide for GIFT City

GIFT City is Gujarat's flagship destination for Non-Resident Indians (NRIs) due to its IFSC ecosystem and global lifestyle.

### NRI Support Services
- Virtual Property Walkthroughs & Remote Shortlisting
- Power of Attorney (POA) Registration Support
- FEMA & NRE/NRO Banking Guidance
- Remote Registration & Professional Rental Management

---

## Frequently Asked Questions (FAQs)

### 1. Why should I buy a flat in GIFT City, Gandhinagar?
GIFT City offers world-class smart city infrastructure, international financial services ecosystem (IFSC), excellent metro connectivity, high rental demand, and strong long-term capital appreciation.

### 2. What types of flats are available in GIFT City?
Buyers can choose from 1 BHK Studios, 2 BHK Apartments, 3 BHK Luxury Flats, 4 BHK Residences, Duplex Homes, Penthouses, Ready-to-Move Apartments, and Under-Construction Projects.

### 3. Are ready-to-move apartments available in GIFT City?
Yes. Buyers can find ready-to-move apartments as well as newly completed and under-construction residential towers.

### 4. Is GIFT City a good real estate investment location in Gujarat?
Yes. The combination of the IFSC financial ecosystem, smart-city infrastructure, and growing corporate employment makes GIFT City one of Gujarat's strongest long-term investment locations.

### 5. Can I get a home loan for buying a flat in GIFT City?
Yes. Leading nationalized and private banks (SBI, HDFC, ICICI, Bank of Baroda) offer pre-approved home loans up to 80-90% for eligible residential properties in GIFT City.

### 6. Are luxury apartments with smart automation available in GIFT City?
Yes. GIFT City offers high-rise luxury towers with app-based home controls, digital locks, infinity pools, co-working lounges, and EV charging stations.

### 7. Should legal documents be verified before purchasing land or flats?
Yes. Buyers should verify title deeds, AnyRoR extracts, approved building plans, BU/Occupancy certificates, and GUJRERA registration.

### 8. Can NRIs buy flats in GIFT City?
Yes. NRIs can freely purchase eligible residential properties in GIFT City in accordance with RBI and FEMA guidelines.

### 9. What amenities are commonly available in GIFT City towers?
Most premium projects offer a clubhouse, infinity pool, gymnasium, business lounge, children's play area, landscaped sky gardens, CCTV security, power backup, covered parking, and EV charging.

### 10. Why choose PropertysDeal for finding flats in GIFT City?
PropertysDeal provides verified property listings, AI-powered property search, trusted builders and agents, transparent information, and direct buyer–seller communication to simplify your home purchase.

---

## Conclusion & Next Steps

A Flat for Sale in GIFT City, Gandhinagar offers the perfect combination of luxury living, smart-city infrastructure, excellent connectivity, and exceptional long-term investment potential. As India's first operational smart financial city continues to expand, demand for quality residential properties is expected to remain strong.

With PropertysDeal, you can explore verified apartment listings, compare projects, connect with trusted builders and property owners, and make informed decisions with complete confidence.
`;

  await pool.query("UPDATE blogs SET content = $1, updated_at = NOW() WHERE slug = 'flat-gift-city-gandhinagar'", [cleanContent]);
  console.log('✅ Successfully updated flat-gift-city-gandhinagar with clean multiline content!');

  // Now re-export backup.sql
  console.log('Re-exporting backup.sql...');
  let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Full Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;

  const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
  sqlDump += fs.readFileSync(schemaPath, 'utf8') + '\n\n';

  const tables = ['states', 'cities', 'localities', 'property_types', 'keywords', 'seo_templates', 'schema_templates', 'faqs', 'blogs'];
  const client = await pool.connect();

  try {
    for (const table of tables) {
      const tableRes = await client.query(`SELECT * FROM ${table}`);
      sqlDump += `-- Data for Table: ${table}\n`;
      for (const row of tableRes.rows) {
        const keys = Object.keys(row);
        const values = keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        sqlDump += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlDump += '\n';
    }

    fs.writeFileSync(path.join(process.cwd(), 'backup.sql'), sqlDump, 'utf8');
    console.log('🎉 Clean backup.sql saved!');
  } finally {
    client.release();
    await pool.end();
  }
}

fixGiftCity();
