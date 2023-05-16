import { json, error as httpError } from '@sveltejs/kit';
import { createSession, type Creds } from '../common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';

import pkg from '@supabase/postgrest-js';
const PostgrestClient = pkg.PostgrestClient;

export async function POST({ request }) {
	const body: Creds = await request.json();

	if (!body.username || !body.auth) {
		throw httpError(400, 'Missing username or auth');
	}

	let { username, auth } = body;

	// Fix username case
	username = username.toLowerCase();

	const postgrest = new PostgrestClient(POSTGREST_URL, {
		headers: { apikey: POSTGREST_KEY, Authorization: `Bearer ${POSTGREST_KEY}` }
	});
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
	return json({ success: true, username, session, sk: data[0].sk });
}
