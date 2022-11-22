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

    const interval = setInterval(async () => {
        time = Math.floor(Date.now() / 1000);
    }, 1000)

    onMount(async () => {
        let res = await fetch('/api/user/' + get(user) + '/publickey')
		let data = await res.json();
        pubKey = data.pk

        token = get(session)
    })

    async function logout() {
        session.set("")
        sk.set("")
        notes.set([])
        window.location.href = "/login"
    }
</script>

<svelte:head>
	<title>Dashboard | 0xNotes</title>
</svelte:head>

<NavBar addClass="" />
<main class="background min-h-screen text-white p-4 py-4 md:px-6 xl:px-80">
    <h1 class="font-bold text-4xl">Hello, {get(user)}!</h1>
    <p>For security purposes, do not share any of this information with anyone, including 0xNotes' administrator. If you have a question, read the FAQ first before contacting us.</p>
    <h2 class="font-bold text-3xl my-4">Encryption</h2>
    <p>0xNotes uses the <a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" class="text-accent">AES-256</a> algorithm to encrypt your notes. Each encryption key is only used once for every note update. Although the key is stored on our database, it is encrypted and only you (and collaborators) can decrypt it. To encrypt/decrypt this key, we use X25519 key exchange algorithm combining your secret key and collaborators' public key.</p>
    <label for="pk" class="font-bold pt-2">Your public key</label>
    <input id="pk" class="rounded-md p-2 w-full" type="text" value="{pubKey}" disabled>
    <label for="sk" class="font-bold pt-2">Your secret key</label>
    <div style="flex flex-row">
        <input id="sk" class="rounded-md p-2 grow" type={skToggle ? "text" : "password"} value="{get(sk)}" disabled>
        <button class="flex-none" on:click={() => {skToggle = !skToggle}}><Fa icon={faEye}/></button>
    </div>
    <h2 class="font-bold text-3xl my-4">Authentication</h2>
    <p>0xNotes uses <a href="https://en.wikipedia.org/wiki/JSON_Web_Token" class="text-accent">JWT</a> to authenticate your request. This token is stored in your browser's local storage and is used to verify your identity. If you are using a public computer, make sure to log out after you're done taking notes.</p>
    <label for="session" class="font-bold pt-2">Your session token</label>
    <input id="session" class="rounded-md p-2 w-full" type="text" value="{get(session)}" disabled>
    <p>This token will expires in 
        { Math.floor((token ? decodeJwt(token).exp - time : 0)/86400) } days
        { Math.floor((token ? decodeJwt(token).exp - time : 0)%86400/3600) } hours
        { Math.floor((token ? decodeJwt(token).exp - time : 0)%3600/60) } minutes
        { Math.floor((token ? decodeJwt(token).exp - time : 0)%60) } seconds</p>
    <button class="p-2 bg-accent rounded-md my-2" on:click={logout}>Log out</button>
</main>