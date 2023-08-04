import { json, error as httpError, error } from '@sveltejs/kit';
import { validateSession } from '$lib/server/common';
import { POSTGREST_URL, POSTGREST_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { AwsClient } from 'aws4fetch';
import { S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT, S3_PUBLIC, S3_REGION } from '$env/static/private';

export async function POST({ request }) {
	const data = await request.formData();
    const auth = request.headers.get('Authorization');const token = request.headers.get('Authorization')?.split(' ')[1];
    const img = data.get("upload");

	if (!token) {
		throw httpError(401, 'Invalid session');
	}

	const { valid, username } = await validateSession(token);

	if (!valid || !username) {
		throw httpError(401, 'Invalid session');
	}

    if (!(img instanceof File)) {
        throw httpError(400, 'Invalid file');
    }

    if (!img.type.startsWith('image/')) {
        throw httpError(400, 'Invalid file type');
    }


    const client = new AwsClient({
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
        service: "s3",
        region: S3_REGION,
    });

    const uuid = crypto.randomUUID();
    const S3_URL = new URL(S3_ENDPOINT);
	S3_URL.pathname = `${S3_URL.pathname}/${uuid}/${img.name}`;

	const signed = await client.sign(
		new Request(S3_URL, {
			method: "PUT",
		}),
		{
			aws: { signQuery: true },
		}
	);

	const res = await fetch(signed.url, {
		method: "PUT",
		body: await img.arrayBuffer(),
		headers: {
			"Content-Type": img.type,
			"Content-Length": String(img.size),
		},
	});

	if (!res.ok) {
		throw error(500, "Upload failed");
	}

    const publicUrl = new URL(S3_PUBLIC);
	publicUrl.pathname = `${uuid}/${img.name}`;

    return json({success: true, url: publicUrl.toString()});
}