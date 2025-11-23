import { NextRequest } from 'next/server';


export async function getSessionOrg(req: NextRequest): Promise<string | null> {
  const cookie = req.headers.get('cookie') ?? '';
  // Stack uses cookie name "stack-access"
  const tokenMatch = cookie.match(/(?:^|;\s*)stack-access=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return null;

  // decode the JWT payload (2nd part)
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );
    // Stack puts the projectId inside "project_id"
    return payload.project_id as string;
  } catch {
    return null;
  }
}