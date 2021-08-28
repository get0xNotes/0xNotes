import Head from 'next/head'
import { useRef, useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
const pako = require('pako');
const axios = require('axios');
const moment = require('moment-timezone');

export default function Dashboard() {
    const [notesInfo, setNotesInfo] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [noteText, setNoteText] = useState("")
    const [noteTitle, setNoteTitle] = useState("")
    const [noteId, setNoteId] = useState(0)

    const editorRef = useRef()
    const [editorLoaded, setEditorLoaded] = useState(false)
    const [editorDisabled, setEditorDisabled] = useState(true)
    const { CKEditor, Editor } = editorRef.current || {}

    const editorConfig = {
        toolbar:
            [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'highlight',
                'link',
                'alignment',
                'bulletedList',
                'numberedList',
                'todoList',
                '|',
                'codeBlock',
                'imageInsert',
                'mediaEmbed',
                'blockQuote',
                'insertTable',
                'undo',
                'redo'
            ],
        autosave: {
            // Save on 5 seconds after last change
            waitingTime: 5000,
            save(editor) {
                return updateNote(noteTitle, editor.getData());
            }
        }
    }

    function hexStringToByte(str) {
        if (!str) {
            return new Uint8Array();
        }

        var a = [];
        for (var i = 0, len = str.length; i < len; i += 2) {
            a.push(parseInt(str.substr(i, 2), 16));
        }

        return new Uint8Array(a);
    }

    function base64ToByte(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function byteToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function byteToHexString(byteArray) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }

    // Decrypt and inflate base64 + nonce into string
    async function decryptAndUncompressNote(encrypted, nonce) {
        if (process.browser) {
            var ec_bytes = base64ToByte(encrypted)
            var key_buf = hexStringToByte(localStorage.getItem('ENCRYPTION_KEY'))
            var counter = hexStringToByte(nonce + "0000000000000000")

            const key = await crypto.subtle.importKey(
                "raw",
                key_buf,
                { "name": "AES-CTR" },
                false,
                ["encrypt", "decrypt"]
            );

            var decrypted = await window.crypto.subtle.decrypt({ name: "AES-CTR", counter: counter, length: 64 }, key, ec_bytes)
            var text = new TextDecoder("utf-8").decode(pako.inflate(decrypted))
            return text;
        }
    }

    // Encrypt and deflate string into [base64. nonce]
    async function encryptAndCompressNote(text) {
        if (process.browser) {
            var compressed = pako.gzip(text)
            var key_buf = hexStringToByte(localStorage.getItem('ENCRYPTION_KEY'))
            var nonce = new Uint8Array(8)
            var zero = new Uint8Array(8)
            window.crypto.getRandomValues(nonce)
            var counter = new Uint8Array(16)
            counter.set(nonce)
            counter.set(zero, 8)

            const key = await crypto.subtle.importKey(
                "raw",
                key_buf,
                { "name": "AES-CTR" },
                false,
                ["encrypt", "decrypt"]
            );

            var encrypted = await window.crypto.subtle.encrypt({ name: "AES-CTR", counter: counter, length: 64 }, key, compressed)
            return [byteToBase64(encrypted), byteToHexString(nonce)]
        }
    }

    async function loadNotes() {
        var response = await axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/notes/list?username=" + localStorage.getItem("USERNAME"), { headers: { "Authorization": "Bearer " + localStorage.getItem("SESSION_TOKEN") } })
        if (response.data.success) {
            var noteList = []
            var notes = response.data.notes
            for (var i = 0; i < notes.length; i++) {
                var id = notes[i].id
                var title = await decryptAndUncompressNote(notes[i].title, notes[i].title_nonce)

                // Format the time to user's timezone
                var date = moment.unix(notes[i].modified).tz(moment.tz.guess()).format("DD/MM/YYYY hh:mm z")
                noteList.push({ "id": id, "title": title, "date": date })
            }
            setNotesInfo(noteList)

            // Store the notes in localstorage for cache
            localStorage.setItem("NOTES_CACHE", JSON.stringify(noteList))
        }
    }

    async function createNote() {
        if (process.browser) {
            // Ask the user for a title
            var title = window.prompt("Enter the title of the note:", "Untitled Note")
            if (title) {
                var [title_encrypted, title_nonce] = await encryptAndCompressNote(title)
                var [note_encrypted, note_nonce] = await encryptAndCompressNote("")
                var data = { "username": localStorage.getItem("USERNAME"), "type": "text_aes", "title": title_encrypted, "title_nonce": title_nonce, "notes": note_encrypted, "notes_nonce": note_nonce }
                axios.post(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/notes/create", data, { headers: { "Authorization": "Bearer " + localStorage.getItem("SESSION_TOKEN") } }).then((response) => {
                    if (response.data.success) {
                        alert("Note created!")
                        loadNotes()
                    } else {
                        alert("Error creating note: " + response.data.error)
                    }
                })
            }
        }
    }

    async function getNote(id) {
        // Show a loading text when the note is loading
        setNoteText("<h2>Loading Note...</h2>")
        setNoteTitle("Loading Note...")
        if (process.browser) {
            try {
                var response = await axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/notes/" + id + "?username=" + localStorage.getItem("USERNAME"), { headers: { "Authorization": "Bearer " + localStorage.getItem("SESSION_TOKEN") } })
                if (response.data.success) {
                    try {
                        var note = await decryptAndUncompressNote(response.data.note, response.data.nonce)
                        var title = await decryptAndUncompressNote(response.data.title, response.data.title_nonce)
                        setNoteText(note)
                        setNoteTitle(title)
                        setEditorDisabled(false)
                    } catch {
                        setNoteTitle("Error Decrypting Note")
                        setNoteText("<h2>Error Decrypting Note</h2><p>Try logging out and login again to reset the encryption key.</p>")
                    }
                } else {
                    setNoteTitle("Error Retrieving Note")
                    setNoteText("<h2>Error Retrieving Note</h2><p>Your session might be expired. Try logging out and login again.</p>")
                }
            } catch {
                setNoteTitle("Error Retrieving Note")
                setNoteText("<h2>Error Retrieving Note</h2><p>Please check if the server or your internet connection is down.</p>")
            }
        }
    }

    async function updateTitle(title) {
        setNoteTitle(title)
    }

    async function updateNote(title, note) {
        if (editorDisabled) {
            // If the editor is disabled (notes not loaded yet), don't update the note
            return
        }

        if (process.browser) {
            var [title_encrypted, title_nonce] = await encryptAndCompressNote(title ? title : "Untitled Note")
            var [note_encrypted, note_nonce] = await encryptAndCompressNote(note)
            var data = { "username": localStorage.getItem("USERNAME"), "type": "text_aes", "notes": note_encrypted, "notes_nonce": note_nonce, "title": title_encrypted, "title_nonce": title_nonce }
            axios.post(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/notes/update/" + noteId, data, { headers: { "Authorization": "Bearer " + localStorage.getItem("SESSION_TOKEN") } }).then((response) => {
                if (response.data.success) {
                    console.log("Note updated!")
                } else {
                    console.log(response.data.error)
                }
            })
        }
    }

    function editNote(id) {
        // Disable editing the note
        setEditorDisabled(true)
        setNoteId(id)

        // Retrieve the note from server
        getNote(id)

        // Show the modal
        setShowModal(true)
    }

    function closeEditor() {
        if (!editorDisabled) {
            // When the modal is closed, only save the note if it has been loaded
            updateNote(noteTitle, noteText)
        }
        // Hide the modal
        setShowModal(false)

        // Refresh the notes cache
        loadNotes()
    }

    useEffect(() => {
        editorRef.current = {
            CKEditor: require("@ckeditor/ckeditor5-react").CKEditor,
            Editor: require("ckeditor5-custom-build/build/ckeditor"),
        }
        setEditorLoaded(true)

        // Load notes from localStorage cache
        var notesCache = localStorage.getItem("NOTES_CACHE")
        setNotesInfo(notesCache ? JSON.parse(notesCache) : [])

        // Retrieve notes from server
        loadNotes()
    }, [])

    return (
        <div className="text-white">
            <Head>
                <title>Dashboard | 0xNotes</title>
            </Head>
            <Navbar />
            <div className="p-3 md:p-8 xl:p-12">
                <button className="p-2 accent rounded-md" onClick={(e) => { createNote() }}>+ Create A New Note</button>
                <div className="flex flex-wrap -mx-2 overflow-hidden">
                    {notesInfo.map(note => (<div key={note.id} className="my-2 px-2 w-full overflow-hidden sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 cursor-pointer" onClick={(e) => { editNote(note.id) }}><div className="h-full break-words bg-gray-600 rounded-md p-3"><h3 className="text-lg">{note.title}</h3><span className="font-thin">{note.date}</span></div></div>))}
                </div>
            </div>
            {showModal ?
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-black"
                    >
                        <div className=" w-11/12 flex h-screen my-6 mx-auto max-w-3xl">
                            <div className="border-0 my-auto h-auto rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                <div className="p-6 flex-auto">
                                    <input type="text" className="rounded border border-gray-400 w-full p-2 mb-4" placeholder="Title" value={noteTitle} onChange={(e) => updateTitle(e.target.value)}></input>
                                    {editorLoaded ? <CKEditor id="editor" disabled={editorDisabled} config={editorConfig} data={noteText} editor={Editor} onChange={(e, editor) => { setNoteText(editor.getData()) }} /> : null}
                                </div>
                                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => closeEditor()}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
                : null}
        </div>
    )
}