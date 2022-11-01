<script lang="ts">
	import NavBar from '../components/NavBar.svelte';
	import Fa from 'svelte-fa';
	import moment from 'moment-timezone';
	import { user, session, sk, notes } from './stores';
	import { get } from 'svelte/store';
	import { SHA256, AES, enc, lib } from 'crypto-js';
	import { sharedKey } from '@stablelib/x25519';
	import { bufferToWords, toHexString, toUint8Array } from '../utils/encoding';
	import { browser } from '$app/env';
	import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';

	var search = '';
	var sortby = 'newest';
	var currentID: number | undefined; // ID of note currently being edited
	var editor = { title: '', content: '' };

	async function getPK(username: string) {
		var res = await fetch('/api/user/' + username + '/publickey');
		var data = await res.json();
		return data.pk;
	}

	async function loadNotes() {
		if (!browser) return;
		var res = await fetch('/api/notes', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + get(session)
			}
		});
		var data = await res.json();
		if (data.success) {
			// Decrypt all titles
			for (var i = 0; i < data.notes.length; i++) {
				var note = data.notes[i];
				var authorSK = toUint8Array(enc.Hex.parse(get(sk)));
				var modifierPK = toUint8Array(enc.Hex.parse(await getPK(note.modifiedBy)));
				var shared = sharedKey(authorSK, modifierPK);
				var key = SHA256(bufferToWords(shared)).toString();

				// Decrypt EK
				var ek = AES.decrypt(note.keys[get(user)], key).toString();

				// Decrypt title
				var title = AES.decrypt(note.title, ek).toString(enc.Utf8);

				// Update note
				data.notes[i].title = title;
			}
			notes.set(data.notes);
		} else {
			alert(data.reason);
		}
	}

	$: loadNotes();

	async function createNote() {
		var title = prompt('Create a new note', 'Title') || 'Untitled Note';
		var content = '';
		var author = get(user);
		var authorSK = toUint8Array(enc.Hex.parse(get(sk)));
		var authorPK = toUint8Array(enc.Hex.parse(await getPK(author)));
		var selfKey = SHA256(bufferToWords(sharedKey(authorSK, authorPK)));
		var EK = lib.WordArray.random(256 / 8);
		var keys = { [author]: AES.encrypt(EK, selfKey.toString()).toString() };
		var encTitle = AES.encrypt(title, EK.toString()).toString();
		var encContent = AES.encrypt(content, EK.toString()).toString();

		var res = await fetch('/api/note/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + get(session)
			},
			body: JSON.stringify({
				keys: keys,
				title: encTitle,
				content: encContent
			})
		});
		await loadNotes();
	}

	async function editNote(id: number) {
		currentID = id;
		var res = await fetch('/api/note/' + id, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + get(session)
			}
		});
		var data = await res.json();
		if (data.success) {
			var note = data.note;
			var authorSK = toUint8Array(enc.Hex.parse(get(sk)));
			var modifierPK = toUint8Array(enc.Hex.parse(await getPK(note.modifiedBy)));
			var shared = sharedKey(authorSK, modifierPK);
			var key = SHA256(bufferToWords(shared)).toString();
			// Decrypt EK
			var ek = AES.decrypt(note.keys[get(user)], key).toString();

			// Decrypt title
			var title = AES.decrypt(note.title, ek).toString(enc.Utf8);

			// Decrypt content
			var content = AES.decrypt(note.content, ek).toString(enc.Utf8);

			// Update note editor
			editor.title = title;
			editor.content = content;
		} else {
			alert(data.reason);
		}
	}
</script>

<svelte:head>
	<title>Dashboard | 0xNotes</title>
</svelte:head>

<NavBar addClass="" />
<main class="background h-screen text-white">
	<div class="flex flex-col md:flex-row pb-2 px-3 pt-3 md:px-8 md:pt-8 xl:px-12 xl:pt-12">
		<input
			class="flex-1 rounded-md p-2 bg-gray-700 mb-4 md:mb-0 mr-0 md:mr-4"
			placeholder="Search"
			bind:value={search}
		/>
		<div class="flex-1 flex flex-row">
			<select id="sort" class="flex-1 bg-gray-700 p-2 rounded-md mr-2" bind:value={sortby}>
				<option value="newest">Newest</option>
				<option value="oldest">Oldest</option>
				<option value="alphabetical">Alphabetical</option>
			</select>
			<button class="flex-1 p-2 bg-accent rounded-md ml-2" on:click={createNote}
				>+ Create A New Note</button
			>
		</div>
	</div>
	<div class="flex flex-wrap px-1 md:px-6 xl:px-10 overflow-hidden">
		{#each $notes as note}
			<div
				class="transform hover:scale-105 my-2 px-2 w-full overflow-hidden sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 cursor-pointer"
				on:click={() => editNote(note['id'])}
			>
				<div class="h-full break-words bg-gray-600 rounded-md p-3">
					<h3 class="text-lg">{note['title']}</h3>
					<div class="flex">
						<Fa icon={faUser} class="my-auto" /><span class="my-auto ml-1 font-thin"
							>{note['author']}</span
						>
					</div>
					<div class="flex">
						<Fa icon={faCalendar} class="my-auto" /><span class="my-auto ml-1 font-thin"
							>{moment(note['modified']).tz(moment.tz.guess()).format('llll z')}</span
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<!-- {#if } -->
</main>
