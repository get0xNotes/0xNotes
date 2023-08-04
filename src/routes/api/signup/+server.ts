import { json, error as httpError } from '@sveltejs/kit';
import { createSession, usernameAvailable, type Creds } from '$lib/server/common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export async function POST({ request }) {
	const body: Creds = await request.json();

	if (!body.username || !body.auth || !body.pk || !body.sk) {
		throw httpError(400, 'Missing username, auth, pk, or sk');
	}

	let { username, auth, pk, sk } = body;

	// Fix username case
	username = username.toLowerCase();

	// Check if username is valid and available
    if (username != username.replace(/[^a-zA-Z0-9_\-.]/g, '').toLowerCase() || username.length < 5 || username.length > 20) {
        throw httpError(400, 'Invalid username');
    }

	const available = await usernameAvailable(username);
	if (!available) {
		throw httpError(400, 'Username is not available');
	}

	// Validate auth, pk, and sk
	if (!/^[0-9a-fA-F]+$/.test(auth) || auth.length != 64) {
		throw httpError(400, 'Invalid auth');
	} else if (!/^[0-9a-fA-F]+$/.test(pk) || pk.length != 64) {
		throw httpError(400, 'Invalid pk');
	} else if (!/^[0-9a-fA-F]+$/.test(sk) || sk.length != 128) {
		// SK is encrypted client-side
		throw httpError(400, 'Invalid sk');
	}

	const postgrest = createClient(POSTGREST_URL, POSTGREST_KEY);
	const { data, error } = await postgrest.from('users').insert([{ username, auth, pk, sk }]);
	if (error) {
		throw httpError(500, 'Database error');
	}
	const session = await createSession(username);
	return json({ success: true, session, username, sk, message: 'Account created' });
}
