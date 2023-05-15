import { json, error as httpError } from '@sveltejs/kit';
import { usernameAvailable } from '../../../common';

export async function GET({ params }) {
	let { username } = params;

	// Validate username
	if (username != username.replace(/[^a-zA-Z0-9_\-.]/g, '').toLowerCase()) {
		return json({ success: false, message: 'Invalid username' });
	} else if (username.length < 5 || username.length > 20) {
		return json({ success: false, message: 'Username must be between 5 and 20 characters' });
	}

	// Check if username is available
	const available = await usernameAvailable(username);
	if (!available) {
		return json({ success: false, message: 'Username is not available' });
	}

	return json({ success: true, message: `Username ${username} is available` });
}
