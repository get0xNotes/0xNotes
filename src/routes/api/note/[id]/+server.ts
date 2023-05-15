import { json, error as httpError } from '@sveltejs/kit';
import { validateSession } from '../../common';
import { PostgrestClient } from '@supabase/postgrest-js';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';

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

	const postgrest = new PostgrestClient(POSTGREST_URL, {
		headers: { apikey: POSTGREST_KEY, Authorization: `Bearer ${POSTGREST_KEY}` }
	});

	const { data, error } = await postgrest
		.from('notes')
		.select('id, title, author, contributors, keys, content, modified, modifiedBy')
		.eq('id', id)
		.contains('contributors', [username]);
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
