// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(req: NextRequest) {
//   const target = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000').replace(/\/$/, '');
//   const backendUrl = `${target}/api/users/me`;

//   console.log('Proxy Target:', backendUrl);
//   console.log('Proxy Headers:', {
//     'x-stack-access-token': req.headers.get('x-stack-access-token'),
//     'Authorization': req.headers.get('authorization'),
//     'cookie': req.headers.get('cookie'),
//   });

//   try {
//     const response = await fetch(backendUrl, {
//       method: 'GET',
//       headers: {
//         'x-stack-access-token': req.headers.get('x-stack-access-token') || '',
//         'Authorization': `Bearer ${req.headers.get('x-stack-access-token') || ''}`,
//         'cookie': req.headers.get('cookie') || '',
//         'Accept': 'application/json',
//       },
//       credentials: 'include',
//     });

//     const contentType = response.headers.get('content-type') || '';
//     const responseText = await response.text();
//     console.log('Backend Response:', {
//       status: response.status,
//       contentType,
//       responseText: responseText.length > 1000 ? responseText.substring(0, 1000) + '...' : responseText,
//     });

//     // Pass all headers except transfer-encoding, and add CORS headers
//     const headers = new Headers();
//     response.headers.forEach((value, key) => {
//       if (key.toLowerCase() !== 'transfer-encoding') {
//         headers.set(key, value);
//       }
//     });
//     headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*'); // Allow the frontend origin
//     headers.set('Access-Control-Allow-Credentials', 'true');

//     return new NextResponse(responseText, {
//       status: response.status,
//       headers,
//     });
//   } catch (error: any) {
//     console.error('Proxy Error:', error.message, error.stack);
//     return new NextResponse(`Proxy error: ${error.message}`, { status: 500 });
//   }
// }