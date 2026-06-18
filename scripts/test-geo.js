async function test() {
  console.log('Fetching geolocation API for local IP...');
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:3000/api/geolocation', {
      headers: {
        'x-forwarded-for': '127.0.0.1' // Simulate loopback IP
      }
    });
    console.log(`Status: ${res.status} (${res.statusText})`);
    const data = await res.json();
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching API:', err);
  }
  console.log(`Time taken: ${Date.now() - start}ms`);
}

test();
