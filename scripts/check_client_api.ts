async function main() {
  console.log('Testing Vercel Live API endpoint...');
  try {
    const res = await fetch('https://seoapipropaty.vercel.app/api/seo/property-in-kalawad-road-rajkot');
    console.log('Vercel Status:', res.status, res.statusText);
    if (res.ok) {
      const json = await res.json();
      console.log('Vercel API title:', json.title);
      console.log('Vercel API content length:', json.content?.length);
    } else {
      const txt = await res.text();
      console.log('Vercel error body:', txt);
    }
  } catch (err) {
    console.error('Vercel fetch error:', err);
  }

  console.log('\nTesting Client Live Admin API endpoint...');
  try {
    const res2 = await fetch('https://admin.propertysdeal.in/api/v1/accounts/landing-page-data/');
    console.log('Client Admin API Status:', res2.status, res2.statusText);
  } catch (err) {
    console.error('Client Admin API error:', err);
  }
}

main();
