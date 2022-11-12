<script>
	import { browser } from '$app/environment';
	import NavBar from '../components/NavBar.svelte';
	import Footer from '../components/Footer.svelte';

	var isLoggedIn = false;
	if (browser) {
		if (localStorage.getItem('SESSION_TOKEN')) {
			isLoggedIn = true;
		}
	}
</script>

<svelte:head>
	<title>0xNotes | End-to-end Encrypted Note-taking App</title>
	<meta name="title" content="0xNotes | End-to-end Encrypted Note-taking App" />
	<meta
		name="description"
		content="0xNotes is an open-source note-taking app that features end-to-end encryption and user privacy protection."
	/>

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://0xnotes.me/" />
	<meta property="og:title" content="0xNotes | End-to-end Encrypted Note-taking App" />
	<meta
		property="og:description"
		content="0xNotes is an open-source note-taking app that features end-to-end encryption and user privacy protection."
	/>
	<meta property="og:image" content="" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://0xnotes.me/" />
	<meta property="twitter:title" content="0xNotes | End-to-end Encrypted Note-taking App" />
	<meta
		property="twitter:description"
		content="0xNotes is an open-source note-taking app that features end-to-end encryption and user privacy protection."
	/>
	<meta property="twitter:image" content="" />

	<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="anonymous" />
	<link
		rel="preload"
		as="style"
		href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap"
	/>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&display=swap"
	/>
</svelte:head>

<NavBar />
<main class="background min-h-screen flex xl:px-14 md:px-10 px-4 pb-5">
	<div class="my-auto flex sm:flex-row-reverse flex-col-reverse">
		<div class="flex flex-1">
			<img src="/desk.webp" class="max-w-full h-auto ml-auto my-auto" alt="A desk with a PC." />
		</div>
		<div class="flex flex-col flex-1 my-auto">
			<h1
				class="py-4 text-white 2xl:text-8xl xl:text-6xl md:text-5xl text-5xl text-center sm:text-left"
			>
				0xNotes is an <mark>end-to-end encrypted</mark> note-taking app
			</h1>
			<p class="py-4 text-center text-white sm:text-left md:text-xl">
				We revolutionize digital note-taking by creating 0xNotes (/nɔt ɛks nəʊts/), one of the first
				note-taking app to feature <b>end-to-end encryption</b>,
				<b>user privacy protection</b>, and it's completely <b>open-source</b>!
			</p>
			<div class="flex flex-row mx-auto sm:mx-0">
				<a style="display: {isLoggedIn ? 'none' : 'block'}" href="/login">
					<button class="bg-accent text-white my-auto mx-1 p-2 px-6 rounded-md">Login</button>
				</a>
				<a style="display: {isLoggedIn ? 'none' : 'block'}" href="/signup">
					<button class="bg-accent text-white my-auto mx-1 p-2 px-6 rounded-md">Sign Up</button>
				</a>
				<a style="display: {isLoggedIn ? 'block' : 'none'}" href="/dash">
					<button class="bg-accent text-white my-auto mx-1 p-2 px-6 rounded-md"
						>Go To Dashboard</button
					>
				</a>
			</div>
		</div>
	</div>
</main>
<Footer />

<style>
	h1 {
		font-family: 'Montserrat', sans-serif;
	}

	mark {
		background-color: transparent;
		background-image: url(/mark-brush.svg);
		background-repeat: no-repeat;
		padding: 0em 0.3em 0em 0.2em;
	}
</style>
