
import { authHeader } from './auth.ts';

const IFOOD_API_BASE = process.env.IFOOD_API_BASE || 'https://merchant-api.ifood.com.br';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function ifoodFetch(path: string, options: RequestOptions = {}) {
    const { headers, params, ...rest } = options;
    const auth = await authHeader();

    const url = new URL(path.startsWith('http') ? path : `${IFOOD_API_BASE}${path}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        headers: {
            'Accept': 'application/json',
            ...auth,
            ...headers,
        },
        ...rest,
    });

    const data = response.status !== 204 ? await response.json().catch(() => null) : null;

    return {
        status: response.status,
        ok: response.ok,
        data,
        headers: response.headers,
    };
}
