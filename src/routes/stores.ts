import { writable } from 'svelte-local-storage-store'

export const user = writable('username', "")
export const session = writable('sessionJWT', "")
export const sk = writable('secretKey', "")