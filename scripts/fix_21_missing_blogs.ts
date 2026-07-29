import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

// Helper to generate full rich blog content dynamically for missing slugs
function generateBlogContent(slug: string): { title: string; metaTitle: string; metaDesc: string; content: string } {
  const readableTitle = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `${readableTitle} | Verified Real Estate Listings & Price Guide 2026`;
  const metaTitle = `${readableTitle} | Buy & Rent Properties in Gujarat`;
  const metaDesc = `Explore top properties for ${readableTitle}. Compare verified listings, price trends, location advantages, amenities, and legal checklists on PropertysDeal.`;

  const content = `# ${readableTitle}

Welcome to the ultimate guide for **${readableTitle}**. Whether you are looking for residential properties, commercial spaces, or investment opportunities, this page provides complete details on prices, top localities, builder projects, and market trends in Gujarat.

---

## Overview & Key Highlights

Gujarat's real estate market continues to see robust growth, driven by world-class infrastructure, industrial expansion, and urban development. Buying or investing in **${readableTitle}** offers significant long-term value, excellent connectivity, and high rental yield potential.

### Key Advantages
- **Prime Strategic Location**: Excellent proximity to main transit corridors, commercial hubs, and educational institutes.
- **Modern Infrastructure**: High-speed road networks, 24/7 water and electricity supply, and planned civic amenities.
- **High Appreciation Potential**: Strong annual property value growth driven by commercial developments.
- **Verified RERA Projects**: Complete legal security with clear titles and developer credentials.

---

## Property Types & Pricing Overview

Whether you are seeking 2 BHK / 3 BHK apartments, luxury villas, commercial offices, or residential plots, there are options for every budget.

### Price Range Estimates
- **Affordable Segment**: ₹25 Lakhs – ₹50 Lakhs
- **Mid-Segment Homes**: ₹50 Lakhs – ₹90 Lakhs
- **Luxury & Premium Properties**: ₹90 Lakhs – ₹2.5+ Crores
- **Commercial & Office Spaces**: Starting from ₹3,500/sq.ft. or ₹25,000/month rent

---

## Top Amenities & Features

- 24/7 Multi-tier Security & CCTV Monitoring
- Dedicated Clubhouse, Gymnasium & Swimming Pool
- Landscaped Green Gardens & Children's Play Areas
- Ample Reserved Parking & EV Charging Facilities
- 100% Power Backup for Common Areas

---

## Legal & Buyer Checklist

Before finalizing any deal for **${readableTitle}**, ensure you verify the following documents:
1. **RERA Registration Number**: Verify the project status on Gujarat RERA portal.
2. **Title Deed & Mother Deed**: Ensure clear, unencumbered ownership title.
3. **Approved Building Plan**: Check local municipal authority approvals (AUDA / SUDA / VUDA / RMC).
4. **NOC & Occupancy Certificate (OC)**: Ensure full compliance with fire safety and civic norms.

---

## Frequently Asked Questions (FAQs)

### 1. Is buying property under ${readableTitle} a good investment?
Yes, continuous infrastructure upgrades and strong rental demand make this a highly lucrative investment opportunity.

### 2. Can I get a home loan for properties in this category?
Yes, all major nationalized and private banks (SBI, HDFC, ICICI, Bank of Baroda, Axis) offer home loans up to 80-90% of the property value.

### 3. How do I verify property titles in Gujarat?
You can verify index-2 documents and property registration details online via the official Gujarat AnyRoR portal or consult a verified legal professional.

---

## Conclusion

Finding the ideal property in **${readableTitle}** is simple with **PropertysDeal**. Explore verified listings, connect directly with owners and builders, and secure the best deals today!
`;

  return { title, metaTitle, metaDesc, content };
}

async function main() {
  const missingSlugs = [
    'property-in-gujarat',
    'real-estate-gujarat',
    'flats-for-sale-in-ahmedabad',
    'property-for-sale-in-ahmedabad',
    '2bhk-flat-ahmedabad',
    '3bhk-flat-surat',
    'plot-for-sale-vadodara',
    'property-dealer-gujarat',
    'buy-property-gujarat',
    'ahmedabad-real-estate',
    'flat-for-sale-in-sg-highway',
    '2bhk-bopal-ahmedabad',
    'property-in-prahlad-nagar',
    'flat-for-sale-in-satellite-ahmedabad',
    'plot-for-sale-in-thaltej',
    '2bhk-manjalpur',
    'residential-plot-for-sale-gujarat',
    'villa-for-sale-vadodara',
    'rental-flats-vesu-surat',
    'office-space-for-rent-ahmedabad',
    'shop-for-sale-surat'
  ];

  console.log(`Fixing ${missingSlugs.length} missing slugs in blogs table...`);
  const client = await pool.connect();

  try {
    for (const slug of missingSlugs) {
      const { title, metaTitle, metaDesc, content } = generateBlogContent(slug);

      await client.query(
        `INSERT INTO blogs (title, slug, content, meta_title, meta_description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title, content = EXCLUDED.content, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, updated_at = NOW()`,
        [title, slug, content, metaTitle, metaDesc]
      );

      await client.query(
        `INSERT INTO keywords (phrase, slug, category, is_active, created_at, updated_at)
         VALUES ($1, $2, 'BLOG', TRUE, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET is_active = TRUE`,
        [title, slug]
      );

      console.log(`✅ Fixed & inserted blog for slug: ${slug}`);
    }

    console.log('🎉 ALL 21 MISSING BLOGS SUCCESSFULLY FIXED & INSERTED!');
  } catch (err) {
    console.error('Error inserting missing blogs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
