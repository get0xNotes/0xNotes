import { redirect } from "@sveltejs/kit"

export async function GET({ cookies }) {
    cookies.delete("session")
    throw redirect(302, "/login")
}
