import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.167.113.116:8080';

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
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

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
    });

    // Get response data
    const responseData = await response.text();
    
    // Create the response with CORS headers
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      nextResponse.headers.set(key, value);
    });

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return nextResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}