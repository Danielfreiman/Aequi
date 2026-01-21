
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(410).json({
    error: 'deprecated',
    message: 'Centralized app uses client_credentials; no redirect/callback flow.'
  });
}
