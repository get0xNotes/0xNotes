import { json, error as httpError } from '@sveltejs/kit';
import { validateSession } from '$lib/server/common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export async function POST({ request, params }) {
	const id = params.id;
	const token = request.headers.get('Authorization')?.split(' ')[1];

	if (!token) {
		throw httpError(401, 'Invalid session');
	}

	const { valid, username } = await validateSession(token);

	if (!valid || !username) {
		throw httpError(401, 'Invalid session');
	}

	const postgrest = createClient(POSTGREST_URL, POSTGREST_KEY);

	const { data, error } = await postgrest
		.from('notes')
		.update({ collaborators: (await request.json()).collaborators })
		.eq('id', id)

	return json({ success: true });
}
