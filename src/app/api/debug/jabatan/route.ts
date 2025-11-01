import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Test connection to backend
    const response = await fetch(`${apiUrl}/api/jabatans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    
    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      url: `${apiUrl}/api/jabatans`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/jabatans`,
    });
  }
}