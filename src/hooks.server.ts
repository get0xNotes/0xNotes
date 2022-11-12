import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({event, resolve}) => {
    const response = await resolve(event);

    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
}