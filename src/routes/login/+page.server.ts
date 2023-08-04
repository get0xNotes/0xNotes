import { validateSession } from '$lib/server/common.js'
import { redirect } from '@sveltejs/kit'

export async function load({ cookies }) {

    const token = cookies.get("session")
    const isLoggedIn = token ? (await validateSession(token)).valid : false

    if (isLoggedIn) {
        throw redirect(302, "/dash")
    }
}
