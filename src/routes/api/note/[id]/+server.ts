import { json, error as httpError } from '@sveltejs/kit';
import { validateSession } from '$lib/server/common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export async function GET({ request, params }) {
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
		.select('id, title, author, collaborators, keys, content, modified, modifiedBy')
		.eq('id', id)
		.contains('collaborators', [username]);
	if (error) {
		console.log(error);
		throw httpError(500, 'Database error');
	} else if (!data) {
		throw httpError(404, 'Note not found');
	}

	const note = data[0];

	// Strip keys belonging to other users
	for (let key in note.keys) {
		if (key != username) {
			delete note.keys[key];
		}
	}

	return json({ success: true, note });
}
