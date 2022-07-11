import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({event, resolve}) => {
    const response = await resolve(event);

    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // TODO: Configure the CSP header to secure loading external fonts and resources (e.g. images).

    return response;
}