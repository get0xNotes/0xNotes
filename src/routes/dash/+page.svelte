<script lang="ts">
	import NavBar from '../../components/NavBar.svelte';
	import Fa from 'svelte-fa';
	import moment from 'moment-timezone';
	import pako from 'pako';
	import DiffMatchPatch from 'diff-match-patch';
	import CryptoJS from 'crypto-js';
	import Tags from 'svelte-tags-input';
	import { Buffer } from 'buffer';
	import { user, session, sk, notes } from '../stores';
	import { get } from 'svelte/store';
	import { sharedKey } from '@stablelib/x25519';
	import { bufferToWords, toHexString, toUint8Array } from '../../lib/encoding';
	import { browser } from '$app/environment';
	import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
	import { socket } from '../../lib/socket';
	import { onMount } from 'svelte';

	let search = '';
	let sortby = 'newest';
	let currentID: number | null | undefined; // ID of note currently being edited
	let editor = { title: '', content: '', collaborators: [], author: '' };
	let ckeditor: any;
	let pubkey: any = {};

	async function getPK(username: string) {
		if (pubkey[username]) return pubkey[username];
		let res = await fetch('/api/user/' + username + '/pubkey');
		let data = await res.json();
		pubkey[username] = data.pk;
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
				var authorSK = toUint8Array(CryptoJS.enc.Hex.parse(get(sk)));
				var modifierPK = toUint8Array(CryptoJS.enc.Hex.parse(await getPK(note.modifiedBy)));
				var shared = sharedKey(authorSK, modifierPK);
				var key = CryptoJS.SHA256(bufferToWords(shared)).toString();

				// Decrypt EK
				var ek = CryptoJS.AES.decrypt(note.keys[get(user)], key).toString();

				// Decrypt title
				var title = CryptoJS.AES.decrypt(note.title, ek).toString(CryptoJS.enc.Utf8);

				// Update note
				data.notes[i].title = title;
			}
			notes.set(data.notes);
		} else {
			session.set('');
			sk.set('');
			notes.set([]);
			window.location.href = '/logout';
		}
	}

	$: loadNotes();

	socket.on('update', async (modifier, id, data) => {
		data['modifiedBy'] = modifier;

		// If modified by another socket, update editor
		if (id != socket.id) {
			var dec = await decrypt(data);
			editor.title = dec.title;
			editor.content = dec.content;

			ckeditor.setData(dec.content);
		}
	});

	async function closeNote() {
		await update();
		socket.emit('leave', get(session), currentID);
		currentID = null;
		editor = { title: '', content: '', collaborators: [], author: '' };
		await loadNotes();
	}

	// Runs when a change is made to the title or content
	async function update() {
		if (editor && currentID && editor.collaborators.length != 0) {
			var content = ckeditor.getData();
			if (editor.content == content) return;
			let encrypted = await encrypt(editor.title, content, editor.collaborators)
			socket.emit('update', get(session), currentID, get(user), encrypted);
		}
	}

	async function createNote() {
		var title = prompt('Create a new note', 'Title') || 'Untitled Note';
		var content = "Welcome to 0xNotes' text editor!";
		var enc = await encrypt(title, content, [get(user)]);

		var res = await fetch('/api/note/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + get(session)
			},
			body: JSON.stringify({
				keys: enc.keys,
				title: enc.title,
				content: enc.content
			})
		});
		var id = (await res.json()).id;
		await loadNotes();
		await editNote(id);
	}

	async function encrypt(title: string, content: string, collaborators: string[]) {
		var me = get(user);
		var mySK = toUint8Array(CryptoJS.enc.Hex.parse(get(sk)));

		// Generate random EK
		var EK = CryptoJS.lib.WordArray.random(256 / 8);

		// for each contributor, generate a shared secret and encrypt EK with it
		var keys: { [x: string]: string } = {};
		for (var i = 0; i < collaborators.length; i++) {
			var contributor = collaborators[i];
			var contributorPK = toUint8Array(CryptoJS.enc.Hex.parse(await getPK(contributor)));
			var shared = sharedKey(mySK, contributorPK);
			var keyKey = CryptoJS.SHA256(bufferToWords(shared)).toString();
			keys[contributor] = CryptoJS.AES.encrypt(EK, keyKey).toString();
		}

		// Compress content
		var compressed = bufferToWords(pako.gzip(Buffer.from(content, 'utf8')));

		// Encrypt title and content with EK
		var encTitle = CryptoJS.AES.encrypt(title, EK.toString()).toString();
		var encContent = CryptoJS.AES.encrypt(compressed, EK.toString()).toString();
		return { keys: keys, title: encTitle, content: encContent };
	}

	async function decrypt(note: any) {
		var mySK = toUint8Array(CryptoJS.enc.Hex.parse(get(sk)));
		var modifierPK = toUint8Array(CryptoJS.enc.Hex.parse(await getPK(note.modifiedBy)));
		var shared = sharedKey(mySK, modifierPK);
		var key = CryptoJS.SHA256(bufferToWords(shared)).toString();
		// Decrypt EK
		var ek = CryptoJS.AES.decrypt(note.keys[get(user)], key).toString();

		// Decrypt title
		var title = CryptoJS.AES.decrypt(note.title, ek).toString(CryptoJS.enc.Utf8);

		// Decrypt content
		var content = CryptoJS.AES.decrypt(note.content, ek);

		// Decompress content
		var decompressed = pako.ungzip(Buffer.from(toUint8Array(content)));

		return { title: title, content: new TextDecoder().decode(decompressed) };
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
			var dec = await decrypt(note);

			// Update note editor
			editor.title = dec.title;
			ckeditor.setData(dec.content);
			editor.collaborators = note.collaborators;
			editor.author = note.author;

			// Request to join room note.id
			socket.emit('join', get(session), note.id);
		} else {
			alert(data.reason);
		}
	}

	onMount(async () => {
		const module = await import('../../lib/ckeditor/ckeditor');
		// Workaround: module is undefined on dev environment
		const ClassicEditor: any = module.default || window.ClassicEditor;
		ckeditor = await ClassicEditor.create(document.querySelector('#editor') as HTMLElement, {
			autosave: {
				waitingTime: 10,
				save(editor: any) {
					return update();
				}
			},
			simpleUpload: {
				uploadUrl: '/api/upload',
				withCredentials: true,
				headers: {
					Authorization: 'Bearer ' + get(session)
				}
			},
			ui: {
				poweredBy: {
					label: '0xNotes powered by'
				}
			}
		});
	});

	async function onCollaboratorChange(event: any) {
		var collaborators = event.detail.tags;
		collaborators.push(get(user));
		collaborators = [...new Set(collaborators)];
		editor.collaborators = collaborators;
		await fetch('/api/note/' + currentID + '/collaborators', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + get(session)
			},
			body: JSON.stringify({
				collaborators
			})
		});
		await update();
	}

	async function sort(event: any) {
		if (search != '') {
			$notes = $notes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase()));
		}
		if (sortby == 'newest') {
			$notes = $notes.sort((a, b) => {
				return new Date(b.modified).getTime() - new Date(a.modified).getTime();
			});
		} else if (sortby == 'oldest') {
			$notes = $notes.sort((a, b) => {
				return new Date(a.modified).getTime() - new Date(b.modified).getTime();
			});
		} else if (sortby == 'alphabetical') {
			$notes = $notes.sort((a, b) => {
				return a.title.localeCompare(b.title);
			});
		}
	}
</script>

<svelte:head>
	<title>Dashboard | 0xNotes</title>
</svelte:head>

<NavBar isLoggedIn={true} />
<main class="background min-h-screen text-white">
	<div class="flex flex-col md:flex-row pb-2 px-3 pt-3 md:px-8 md:pt-8 xl:px-12 xl:pt-12">
		<input
			class="flex-1 rounded-md p-2 bg-gray-700 mb-4 md:mb-0 mr-0 md:mr-4"
			placeholder="Search"
			bind:value={search}
		/>
		<div class="flex-1 flex flex-row">
			<select id="sort" class="flex-1 bg-gray-700 p-2 rounded-md mr-2" bind:value={sortby} on:change={sort}>
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
					<h3 class="text-lg line-clamp-3">{note['title']}</h3>
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
	<div
		class="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-black {currentID
			? 'block'
			: 'hidden'}"
	>
		<div class=" w-11/12 flex h-screen my-6 mx-auto max-w-4xl">
			<div
				class="border-0 my-auto h-auto rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
			>
				<div class="p-6 flex-auto">
					<input
						type="text"
						class="rounded border border-gray-400 w-full p-2 mb-4"
						placeholder="Title"
						bind:value={editor.title}
						on:keyup={update}
					/>
					<textarea class="rounded border border-gray-400 w-full p-2 mb-4" id="editor" />
					{#if editor.author == get(user)}
						<Tags
							tags={editor.collaborators.filter((item) => item !== get(user))}
							on:tags={onCollaboratorChange}
							onlyUnique={true}
							allowPaste={false}
							labelText="Collaborators"
							labelShow
						/>
					{/if}
				</div>
				<div
					class="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b"
				>
					<button
						class="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
						on:click={closeNote}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</main>
