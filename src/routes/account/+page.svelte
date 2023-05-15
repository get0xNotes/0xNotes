<script lang="ts">
	import Fa from 'svelte-fa';
	import { faEye } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import NavBar from '../../components/NavBar.svelte';
	import { user, session, sk, notes } from '../stores';
	import { decodeJwt } from 'jose';

	let pubKey: string;
	let skToggle: boolean = false;

	let token: string;
	let time: number;

	setInterval(async () => {
		time = Math.floor(Date.now() / 1000);
	}, 1000);

	onMount(async () => {
		let res = await fetch('/api/user/' + get(user) + '/pubkey')
		let data = await res.json();
		pubKey = data.pk

		token = get(session);
		console.log(decodeJwt(token).exp);
	});

	async function logout() {
		session.set('');
		sk.set('');
		notes.set([]);
		window.location.href = '/login';
	}
</script>

<svelte:head>
	<title>Dashboard | 0xNotes</title>
</svelte:head>

<NavBar addClass="" />
<main class="background min-h-screen text-white p-4 py-4 md:px-6">
	<div class="max-w-6xl mx-auto">
		<h1 class="font-bold text-4xl my-4">Hello, {get(user)}!</h1>
		<p>
			To ensure security, it is essential not to disclose any of this information to anyone,
			including the administrator of 0xNotes. If you have any inquiries, we kindly request that you
			consult the FAQ section before reaching out to us.
		</p>
		<h2 class="font-bold text-3xl my-4">Encryption</h2>
		<p class="mb-4">
			To protect your notes, 0xNotes uses the <a
				href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard"
				class="text-accent">AES-256-GCM</a
			> algorithm for encryption. Every time your note is updated, a unique key will be generated. While
			the key is stored in our database, it is encrypted and only you (along with any collaborators)
			can decrypt it. The encryption/decryption of this key involves X25519 key exchange algorithm, which
			combines your secret key with the public keys of your collaborators.
		</p>
		<label for="pk" class="font-bold pt-2">Your public key</label>
		<input id="pk" class="rounded-md p-2 w-full" type="text" value={pubKey} disabled />
		<label for="sk" class="font-bold pt-2">Your secret key</label>
		<div style="flex flex-row">
			<input
				id="sk"
				class="rounded-md p-2 grow"
				type={skToggle ? 'text' : 'password'}
				value={get(sk)}
				disabled
			/>
			<button
				class="flex-none"
				on:click={() => {
					skToggle = !skToggle;
				}}><Fa icon={faEye} /></button
			>
		</div>
		<h2 class="font-bold text-3xl my-4">Authentication</h2>
		<p class="mb-4">
			For authentication, 0xNotes employs <a
				href="https://en.wikipedia.org/wiki/JSON_Web_Token"
				class="text-accent">JWT</a
			> to verify your request. This token is stored in the local storage of your browser and serves
			to authenticate your identity If you are using a public computer, we strongly recommend logging
			out after completing your note-taking tasks.
		</p>
		<label for="session" class="font-bold pt-2">Your session token</label>
		<input id="session" class="rounded-md p-2 w-full" type="text" value={get(session)} disabled />
		<p>
			This token will expire in
			{Math.floor((token ? decodeJwt(token).exp - time : 0) / 86400)} days
			{Math.floor(((token ? decodeJwt(token).exp - time : 0) % 86400) / 3600)} hours
			{Math.floor(((token ? decodeJwt(token).exp - time : 0) % 3600) / 60)} minutes
			{Math.floor((token ? decodeJwt(token).exp - time : 0) % 60)} seconds
		</p>
		<button class="p-2 bg-accent rounded-md my-4" on:click={logout}>Log out</button>
	</div>
</main>
