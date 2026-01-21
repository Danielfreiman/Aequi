
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getIfoodToken } from '../_lib/ifood/auth.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const token = await getIfoodToken();

        // NUNCA retorne o token bruto
        res.status(200).json({
            ok: true,
            hasToken: !!token.accessToken,
            expiresAt: token.expiresAt,
            expiresIn: token.expiresIn,
            now: Date.now(),
        });
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            error: error.message || 'Failed to get token'
        });
    }
}
