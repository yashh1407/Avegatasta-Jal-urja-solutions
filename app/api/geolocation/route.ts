import { NextRequest, NextResponse } from 'next/server';

// Helper to determine if an IP is local, loopback, or private
function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  
  let cleanIp = ip.trim();
  // Strip IPv4-mapped IPv6 prefix
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.substring(7);
  }
  
  if (cleanIp === '::1' || cleanIp === 'localhost' || cleanIp === '0:0:0:0:0:0:0:1') {
    return true;
  }
  
  // Match IPv4 octets
  const ipv4Pattern = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
  const match = cleanIp.match(ipv4Pattern);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);
    
    // 127.0.0.0/8 (Loopback)
    if (octet1 === 127) return true;
    // 10.0.0.0/8 (Private Class A)
    if (octet1 === 10) return true;
    // 172.16.0.0/12 (Private Class B)
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    // 192.168.0.0/16 (Private Class C)
    if (octet1 === 192 && octet2 === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (octet1 === 169 && octet2 === 254) return true;
  }
  
  return false;
}

// Custom fetch with timeout to prevent hanging on network blocks
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  let clientIp = '';
  try {
    // 1. Resolve client IP address from standard headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      clientIp = forwarded.split(',')[0].trim();
    } else {
      clientIp = request.headers.get('x-real-ip') || '';
    }

    console.log(`[Geolocation API] Request IP resolved as: "${clientIp}"`);

    let resolvedIp = clientIp;
    const isLocal = isPrivateOrLocalIp(clientIp);

    if (isLocal) {
      console.log(`[Geolocation API] IP "${clientIp}" detected as local/loopback. Attempting to fetch server public IP...`);
      // Try to fetch server's public IP address as a proxy for client location in dev mode
      try {
        const ipifyRes = await fetchWithTimeout('https://api.ipify.org?format=json', {}, 2000);
        if (ipifyRes.ok) {
          const ipifyData = await ipifyRes.json();
          resolvedIp = ipifyData.ip;
          console.log(`[Geolocation API] Server public IP resolved as: "${resolvedIp}"`);
        }
      } catch (e) {
        console.warn('[Geolocation API] Failed to fetch server public IP (likely offline or firewall blocked):', e);
      }
    }

    // Check if the resolved IP is still a private/local IP
    const isStillLocal = isPrivateOrLocalIp(resolvedIp);
    if (isStillLocal) {
      console.log(`[Geolocation API] Resolved IP is still local. Returning default Mumbai fallback coordinates.`);
      return NextResponse.json({
        latitude: 19.0760,
        longitude: 72.8777,
        accuracy: 5000,
        city: 'Mumbai (Dev Fallback)',
        region: 'Maharashtra',
        country: 'India',
        ip: resolvedIp || 'local-fallback',
        isFallback: true
      });
    }

    // 2. Query geolocation providers with strict timeout
    // Try ip-api.com first (free, no API key, reliable)
    try {
      console.log(`[Geolocation API] Querying ip-api.com for IP: ${resolvedIp}`);
      const res = await fetchWithTimeout(`http://ip-api.com/json/${resolvedIp}`, {}, 2000);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          console.log(`[Geolocation API] ip-api.com success: ${data.city}, ${data.lat}, ${data.lon}`);
          return NextResponse.json({
            latitude: Number(data.lat),
            longitude: Number(data.lon),
            accuracy: 10000,
            city: data.city,
            region: data.regionName,
            country: data.country,
            ip: resolvedIp,
            isFallback: false
          });
        }
      }
    } catch (e) {
      console.warn('[Geolocation API] ip-api.com lookup failed or timed out:', e);
    }

    // Try ipapi.co as secondary provider
    try {
      console.log(`[Geolocation API] Querying ipapi.co for IP: ${resolvedIp}`);
      const res = await fetchWithTimeout(`https://ipapi.co/${resolvedIp}/json/`, {}, 2000);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          console.log(`[Geolocation API] ipapi.co success: ${data.city}, ${data.latitude}, ${data.longitude}`);
          return NextResponse.json({
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            accuracy: data.accuracy ? Number(data.accuracy) : 15000,
            city: data.city,
            region: data.region,
            country: data.country_name,
            ip: resolvedIp,
            isFallback: false
          });
        }
      }
    } catch (e) {
      console.warn('[Geolocation API] ipapi.co lookup failed or timed out:', e);
    }

    // If all lookups fail, default to Mumbai
    console.log(`[Geolocation API] All geolocation lookups failed. Returning default Mumbai fallback coordinates.`);
    return NextResponse.json({
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 5000,
      city: 'Mumbai (Default)',
      region: 'Maharashtra',
      country: 'India',
      ip: resolvedIp,
      isFallback: true
    });

  } catch (err: any) {
    console.error('[Geolocation API] Critical error in route handler:', err);
    return NextResponse.json({
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 5000,
      city: 'Mumbai (Error Fallback)',
      region: 'Maharashtra',
      country: 'India',
      ip: clientIp || 'error-fallback',
      isFallback: true
    });
  }
}
