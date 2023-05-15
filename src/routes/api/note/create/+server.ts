import { json, error as httpError } from '@sveltejs/kit';
import { PostgrestClient } from '@supabase/postgrest-js';
import { validateSession } from '../../common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';

type NewNote = {
	keys: { [x: string]: string };
	title: string;
	content: string;
};

export async function POST({ request }) {
	const token = request.headers.get('Authorization')?.split(' ')[1];
    const body: NewNote = await request.json()

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

    const { data, error } = await postgrest.from('notes').insert([{author: username, contributors: [username], keys: body.keys, title: body.title, content: body.content, modified: new Date().toISOString(), modifiedBy: username}]).select('id')
    if (error || !data) {
        console.log(error)
        throw httpError(500, 'Database error');
    }

    return json({success: true, id: data[0].id})
    

}
