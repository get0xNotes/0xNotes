<script lang="ts">
	import NavBar from '../../components/NavBar.svelte';
	import Footer from '../../components/Footer.svelte';
	import zxcvbn from 'zxcvbn';
	import { SHA256, PBKDF2, AES, enc } from 'crypto-js';
	import { generateKeyPair } from '@stablelib/x25519';
	import { user, session, sk } from '../stores';
	import { get } from 'svelte/store';
	import { bufferToWords, toHexString } from '../../lib/encoding';
	import { goto } from '$app/navigation';

	var username = '';
	var password = '';
	var confirm = '';
	var uAvailable = false;
	var uMessage = '';
	var uColor = '';
	var allowSubmit = false;

	$: if (username) {
		username = username.replace(/[^0-9a-zA-Z_\-.]/g, '').toLowerCase();
		if (username.length < 5) {
			uMessage = 'Username must be at least 5 characters long.';
			uColor = '#ef4444';
		} else {
			fetch('/api/user/' + username + '/available')
				.then((res) => res.json())
				.then((data) => {
					uAvailable = data.success;
					uMessage = data.message;
					uColor = data.success ? '#10b981' : '#ef4444';
				});
		}
	}

	$: if (uAvailable && password == confirm && zxcvbn(password).score == 4) {
		allowSubmit = true;
	} else {
		allowSubmit = false;
	}

	$: if (get(user) && get(session) && get(sk)) {
		goto('/dash');
	}

	async function signup() {
		if (allowSubmit) {
			// Clear confirm password
			confirm = '';

			// Generate master key, auth key, and ECDH keypair
			var masterKey = PBKDF2(password, username + '0xNotes', {
				keySize: 256 / 32,
				iterations: 100000
			}).toString();
			var authKey = enc.Hex.stringify(SHA256(masterKey));
			var ecdhPair = generateKeyPair();

			// POST to API
			var res = await fetch('/api/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: username,
					auth: authKey,
					pk: toHexString(ecdhPair.publicKey),
					sk: enc.Hex.stringify(
						enc.Base64.parse(AES.encrypt(bufferToWords(ecdhPair.secretKey), masterKey).toString())
					)
				})
			});
			var data = await res.json();
			if (data.success) {
				user.set(username);
				session.set(data.session);
				sk.set(toHexString(ecdhPair.secretKey));
				window.location.href = '/dash';
			} else {
				alert('An error occurred while signing up.');
			}
		} else {
			alert(
				'Please make sure your username is available, your passwords match, and your password is strong.'
			);
		}
	}
</script>

<svelte:head>
	<title>Sign Up | 0xNotes</title>
</svelte:head>

<NavBar addClass="sm:absolute" />
<main class="background min-h-screen py-6 flex">
	<div
		class="flex flex-col mx-auto my-auto p-6 rounded-md xl:w-3/12 md:w-2/4 w-4/5 bg-primarylight text-white"
	>
		<h1 class="mx-auto mb-5 sm:text-3xl text-2xl font-bold">Create your 0xNotes account</h1>
		<div class="my-5 flex flex-col">
			<label for="username" class="mx-1">Username</label>
			<input
				id="username"
				type="text"
				class="mx-auto w-full p-2 rounded-md border-4 border-primarylight text-black"
				placeholder="Username"
				bind:value={username}
			/>
			<span class="px-1" style="color: {uColor};" id="availability">{uMessage}</span>
			<label for="password" class="mx-1">Password</label>
			<input
				id="password"
				type="password"
				class="mx-auto w-full p-2 rounded-md border-4 border-primarylight text-black"
				placeholder="Password"
				bind:value={password}
			/>
			<div class="flex flex-col p-1">
				<div class="h-1 w-auto bg-red-500 {zxcvbn(password).score <= 2 ? 'visible' : 'hidden'}" />
				<div
					class="h-1 w-auto bg-yellow-500 {zxcvbn(password).score == 3 ? 'visible' : 'hidden'}"
				/>
				<div class="h-1 w-auto bg-green-500 {zxcvbn(password).score == 4 ? 'visible' : 'hidden'}" />
				<span class="text-red-500">{password ? zxcvbn(password).feedback.suggestions : ''}</span>
			</div>
			<label for="2fa" class="mx-1">Confirm Password</label>
			<input
				id="confirm"
				type="password"
				class="mx-auto w-full p-2 rounded-md border-4 border-primarylight text-black"
				placeholder="Confirm Password"
				bind:value={confirm}
			/>
			<span class="px-1 text-red-500">{password != confirm ? 'Passwords do not match.' : ''}</span>
		</div>
		<button
			class="bg-accent mt-1 mx-1 p-2 rounded-md disabled:bg-sky-800"
			on:click={signup}
			disabled={!allowSubmit}>Sign Up</button
		>
		<div class="mx-auto mt-5">
			<span>Already registered? </span>
			<a href="/login" class="underline">Login here.</a>
		</div>
	</div>
</main>
<Footer />
