import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id/';

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

async function handleRequest(request: NextRequest, method: string) {
  try {
    // Extract the API path from the request URL
    const url = new URL(request.url);
    const apiPath = url.pathname.replace('/api/proxy', '');
    const targetUrl = `${API_BASE_URL}${apiPath}${url.search}`;

    // Get request headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip certain headers that shouldn't be forwarded
      if (!['host', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Forward CSRF tokens if present
    const csrfToken = request.cookies.get('XSRF-TOKEN')?.value || 
                      request.cookies.get('csrf_token')?.value;
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = csrfToken;
      headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Add origin header for CORS
    headers['Origin'] = new URL(API_BASE_URL).origin;

    // Get request body for POST/PUT requests
    let body;
    if (['POST', 'PUT'].includes(method)) {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = JSON.stringify(await request.json());
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        body = await request.text();
      }
    }

    // Make the request to the backend API
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      credentials: 'include', // Include cookies for CSRF
    });

    // Get response data
    const responseData = await response.text();
    
    // Create the response with CORS headers
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers (including Set-Cookie for CSRF)
    response.headers.forEach((value, key) => {
      // Forward Set-Cookie headers for CSRF tokens
      if (key.toLowerCase() === 'set-cookie' || 
          !['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        nextResponse.headers.set(key, value);
      }
    });

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, X-CSRF-TOKEN');
    nextResponse.headers.set('Access-Control-Allow-Credentials', 'true');

    return nextResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-XSRF-TOKEN, X-CSRF-TOKEN',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}