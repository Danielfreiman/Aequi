
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ifoodFetch } from '../_lib/ifood/client.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Tenta listar merchants (endpoint comum)
        const result = await ifoodFetch('/merchant/v1.0/merchants');

        if (result.ok) {
            res.status(200).json({
                ok: true,
                status: result.status,
                merchants: result.data // Safe to return basic info
            });
        } else {
            res.status(result.status).json({
                ok: false,
                step: 'api_call',
                status: result.status,
                error: result.data,
                message: 'Token works (got header), but API call failed'
            });
        }

    } catch (error: any) {
        res.status(500).json({
            ok: false,
            error: error.message || 'Smoke test failed'
        });
    }
}
