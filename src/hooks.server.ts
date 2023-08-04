import { validateSession } from "$lib/server/common";
import { redirect, type Handle } from "@sveltejs/kit"

export const handle: Handle = async ({event, resolve}) => {

    if (event.url.pathname.startsWith("/dash") || event.url.pathname.startsWith("/account")) {
		// Check if token is present
		const jwt = event.cookies.get("session");

        if (!jwt) {
            throw redirect(302, "/login");
        }

		// Check if token is valid
		const {valid, username} = await validateSession(jwt);
        console.log(valid)
		if (!valid) {
            event.cookies.delete("session");
			throw redirect(302, "/login");
		}
	}

    const response = await resolve(event);

    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
}