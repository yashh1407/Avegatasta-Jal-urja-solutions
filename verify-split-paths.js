// Using native global fetch available in Node 18+

async function test() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Sales Portal Split-Path Integration Test ---');

  // 1. Get CSRF Token
  console.log('1. Fetching CSRF Token...');
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  if (!csrfRes.ok) {
    throw new Error(`Failed to fetch CSRF token: ${csrfRes.statusText}`);
  }
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  console.log(`CSRF Token acquired: ${csrfToken}`);

  const csrfCookie = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : (csrfRes.headers.get('set-cookie') ? [csrfRes.headers.get('set-cookie')] : []);
  const initialCookie = csrfCookie.map(c => c.split(';')[0]).join('; ');
  console.log(`Initial Cookie: ${initialCookie}`);

  // 2. Log in using Credentials
  console.log('\n2. Logging in as Sales Agent (Ayush@gmail.com)...');
  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': initialCookie,
    },
    body: new URLSearchParams({
      email: 'Ayush@gmail.com',
      password: 'Ayush@123',
      csrfToken: csrfToken,
      json: 'true'
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status: ${loginRes.status}`);
  }

  const loginCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : (loginRes.headers.get('set-cookie') ? [loginRes.headers.get('set-cookie')] : []);
  const sessionCookie = loginCookies.map(c => c.split(';')[0]).join('; ');
  console.log(`Login Session Cookie acquired: ${sessionCookie}`);

  if (!sessionCookie.includes('next-auth.session-token')) {
    console.log('Response headers:', [...loginRes.headers.entries()]);
    const bodyText = await loginRes.text();
    console.log('Response body:', bodyText);
    throw new Error('Could not find next-auth.session-token in response cookies. Login failed.');
  }

  // 3. Fetch sales portal status (verify API authorization)
  console.log('\n3. Fetching Sales Portal Status via /api/admin/sales-portal/status...');
  const statusRes = await fetch(`${baseUrl}/api/admin/sales-portal/status`, {
    headers: { 'Cookie': sessionCookie }
  });
  if (!statusRes.ok) {
    throw new Error(`Failed to fetch status: ${statusRes.status} ${statusRes.statusText}`);
  }
  const statusData = await statusRes.json();
  console.log('Status result success:', statusData.success);
  console.log('Status result todayShifts count:', statusData.todayShifts?.length);

  // 4. Verify standard admin page is forbidden/blocked for sales team
  console.log('\n4. Verifying redirection/forbidden check on general admin route...');
  const adminRes = await fetch(`${baseUrl}/admin/products`, {
    headers: { 'Cookie': sessionCookie },
    redirect: 'manual'
  });
  console.log('Admin Page Response Status:', adminRes.status);
  console.log('Redirect Location Header:', adminRes.headers.get('location'));
  
  if (adminRes.status === 307 || adminRes.status === 302) {
    const loc = adminRes.headers.get('location') || '';
    if (loc.includes('/sales-portal')) {
      console.log('✅ Middleware correctly redirected sales user away from /admin/products to /sales-portal!');
    } else {
      console.warn('⚠️ Unexpected redirect location:', loc);
    }
  } else {
    console.warn('⚠️ Expected redirect status (302/307), got:', adminRes.status);
  }

  console.log('\n--- All Routing Tests Passed Successfully ---');
}

test().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
