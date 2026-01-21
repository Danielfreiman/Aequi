
const IFOOD_API_BASE = process.env.IFOOD_API_BASE || 'https://merchant-api.ifood.com.br';
const TOKEN_TTL_BUFFER = Number(process.env.IFOOD_TOKEN_TTL_BUFFER) || 60; // seconds

interface TokenCache {
    accessToken: string | null;
    expiresAt: number | null;
}

const cache: TokenCache = {
    accessToken: null,
    expiresAt: null,
};

export async function getIfoodToken() {
    const clientId = process.env.IFOOD_CLIENT_ID;
    const clientSecret = process.env.IFOOD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing IFOOD_CLIENT_ID or IFOOD_CLIENT_SECRET env vars');
    }

    const now = Date.now();

    // Return cached token if still valid (minus buffer)
    if (
        cache.accessToken &&
        cache.expiresAt &&
        now < cache.expiresAt - TOKEN_TTL_BUFFER * 1000
    ) {
        return {
            accessToken: cache.accessToken,
            expiresAt: cache.expiresAt,
            expiresIn: Math.floor((cache.expiresAt - now) / 1000),
        };
    }

    // Request new token
    const params = new URLSearchParams();
    params.append('grantType', 'client_credentials');
    params.append('clientId', clientId);
    params.append('clientSecret', clientSecret);

    try {
        const response = await fetch(`${IFOOD_API_BASE}/authentication/v1.0/oauth/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Log secure error
            console.error('[iFood Auth] Token request failed', {
                status: response.status,
                statusText: response.statusText,
            });
            throw new Error(`iFood Auth Failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        if (!data.accessToken || !data.expiresIn) {
            throw new Error('Invalid token response format');
        }

        const expiresAt = Date.now() + (data.expiresIn * 1000);

        // Update cache
        cache.accessToken = data.accessToken;
        cache.expiresAt = expiresAt;

        return {
            accessToken: data.accessToken,
            expiresAt,
            expiresIn: data.expiresIn,
        };

    } catch (error) {
        console.error('[iFood Auth] Error getting token', error);
        throw error;
    }
}

export async function authHeader() {
    const { accessToken } = await getIfoodToken();
    return { Authorization: `Bearer ${accessToken}` };
}
