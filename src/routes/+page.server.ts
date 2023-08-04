import { validateSession } from '$lib/server/common.js'

export async function load({ cookies }) {

    const token = cookies.get("session")
    const isLoggedIn = token ? (await validateSession(token)).valid : false

    return {
        isLoggedIn
    }
}
