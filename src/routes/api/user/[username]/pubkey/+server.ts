import { json, error as httpError } from '@sveltejs/kit';
import { POSTGREST_KEY, POSTGREST_URL } from '$env/static/private';

import pkg from '@supabase/postgrest-js';
const PostgrestClient = pkg.PostgrestClient;

export async function GET({ params }) {
	let { username } = params;

	const postgrest = new PostgrestClient(POSTGREST_URL, {
		headers: { apikey: POSTGREST_KEY, Authorization: `Bearer ${POSTGREST_KEY}` }
	});

	const { data, error } = await postgrest.from('users').select('pk').eq('username', username);
	if (error) {
		throw httpError(500, 'Database error');
	} else if (data.length < 1) {
		throw httpError(404, 'User not found');
	}

	return json({ success: true, pk: data[0].pk });
}
