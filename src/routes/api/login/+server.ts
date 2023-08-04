import { json, error as httpError } from '@sveltejs/kit';
import { createSession, type Creds } from '$lib/server/common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export async function POST({ request, cookies }) {
	const body: Creds = await request.json();

	if (!body.username || !body.auth) {
		throw httpError(400, 'Missing username or auth');
	}

	let { username, auth } = body;

	// Fix username case
	username = username.toLowerCase();

	const postgrest = createClient(POSTGREST_URL, POSTGREST_KEY);
	const { data, error } = await postgrest
		.from('users')
		.select('sk')
		.eq('username', username)
		.eq('auth', auth);
	if (error) {
		throw httpError(500, 'Database error');
	} else if (data.length == 0) {
		throw httpError(401, 'Invalid username or password');
	}

	const session = await createSession(username);
	cookies.set('session', session, {
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
		sameSite: 'lax',
		secure: true,
		httpOnly: true,
	});
	return json({ success: true, username, session, sk: data[0].sk });
}
