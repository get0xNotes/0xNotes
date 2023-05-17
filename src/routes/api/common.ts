import * as jose from 'jose';
import { SERVER_JWK, POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export type Creds = {
	username: string;
	auth: string;
	pk?: string;
	sk?: string;
	totp?: string;
};

export async function createSession(aud: string, iss: string = '0xNotes', exp: string = '1d') {
	return await new jose.SignJWT({ claim: true })
		.setProtectedHeader({ alg: 'EdDSA' })
		.setIssuedAt()
		.setIssuer(iss)
		.setAudience(aud)
		.setExpirationTime(exp)
		.sign(await jose.importJWK(JSON.parse(SERVER_JWK)));
}

export async function validateSession(token: string) {
	let JWK = JSON.parse(SERVER_JWK)
	delete JWK.d
	try {
	  const { payload, protectedHeader } = await jose.jwtVerify(token, await jose.importJWK(JWK), {issuer: '0xNotes'})
	  return {valid: true, username: payload.aud as string}
	} catch (e) {
	  return {valid: false, username: null}
	}
  }

export async function usernameAvailable(username: string) {
	const postgrest = createClient(POSTGREST_URL, POSTGREST_KEY);
	const { data, error } = await postgrest
		.from('users')
		.select('username')
		.eq('username', username.toLowerCase());
	if (error || data.length > 0) {
		return false;
	}
	return true;
}
