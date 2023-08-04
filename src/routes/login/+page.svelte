<script>
	import NavBar from '../../components/NavBar.svelte';
	import Footer from '../../components/Footer.svelte';
	import { SHA256, PBKDF2, AES, enc } from 'crypto-js';
	import { user, session, sk } from '../stores';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';

	let username = get(user);
	let password = '';
	let totpcode = '';

	async function login() {
		var masterKey = PBKDF2(password, username + '0xNotes', {
			keySize: 256 / 32,
			iterations: 100000
		}).toString();
		var authKey = enc.Hex.stringify(SHA256(masterKey));

		// TODO: TOTP and long-term session

		var res = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				auth: authKey
			})
		});
		var data = await res.json();
		if (data.success) {
			session.set(data.session);
			user.set(data.username);

			// Decrypt SK
			var secretKey = AES.decrypt(enc.Base64.stringify(enc.Hex.parse(data.sk)), masterKey);
			sk.set(enc.Hex.stringify(secretKey));

			// Redirect to dashboard
			goto('/dash');
		} else {
			alert(data.message);
		}
	}
</script>

<svelte:head>
	<title>Login | 0xNotes</title>
</svelte:head>

<NavBar addClass="sm:absolute" />
<main class="background min-h-screen py-6 flex">
	<div
		class="flex flex-col mx-auto my-auto p-6 rounded-md xl:w-3/12 md:w-2/4 w-4/5 bg-primarylight text-white"
	>
		<h1 class="mx-auto mb-5 sm:text-3xl text-2xl font-bold">Login to 0xNotes</h1>
		<div class="my-5 flex flex-col">
			<label for="username" class="mx-1">Username</label>
			<input
				id="username"
				type="text"
				class="mx-auto w-full p-2 rounded-md border-4 border-primarylight text-black"
				placeholder="Username"
				bind:value={username}
			/>
			<label for="password" class="mx-1">Password</label>
			<input
				id="password"
				type="password"
				class="mx-auto w-full p-2 rounded-md border-4 border-primarylight text-black"
				placeholder="Password"
				bind:value={password}
			/>
			<label for="2fa" class="mx-1">2FA (if enabled)</label>
			<input
				id="2fa"
				type="text"
				class="mx-auto w-full p-2 rounded-md border-4 border-primarylight text-black"
				placeholder="2FA code"
				bind:value={totpcode}
			/>
			<div class="mx-1 mt-1">
				<input id="longsession" type="checkbox" />
				<label for="longsession" class="ml-1">Keep me logged in for a week!</label>
			</div>
		</div>
		<button class="bg-accent mt-1 mx-1 p-2 rounded-md hover:scale-105" on:click={login}>Login</button>
		<div class="mx-auto mt-5">
			<span>New user? </span>
			<a href="/signup" class="underline">Create an account.</a>
		</div>
	</div>
</main>
<Footer />
