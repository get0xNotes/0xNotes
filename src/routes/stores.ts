import { persisted } from 'svelte-local-storage-store'

export const user = persisted('username', "")
export const session = persisted('sessionJWT', "")
export const sk = persisted('secretKey', "")
export const notes = persisted('notes', [])