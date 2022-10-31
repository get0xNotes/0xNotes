import { lib } from 'crypto-js'

export function toHexString(byteArray: Uint8Array) {
    var s = ""
    byteArray.forEach(function(byte) {
        s += ('0' + (byte & 0xFF).toString(16)).slice(-2)
    })
    return s
}

export function toUint8Array(wordArray: CryptoJS.lib.WordArray) {
    var len = wordArray.words.length,
        u8_array = new Uint8Array(len << 2),
        offset = 0, word, i
    ;
    for (i=0; i<len; i++) {
        word = wordArray.words[i];
        u8_array[offset++] = word >> 24;
        u8_array[offset++] = (word >> 16) & 0xff;
        u8_array[offset++] = (word >> 8) & 0xff;
        u8_array[offset++] = word & 0xff;
    }
    return u8_array;
}


export function bufferToWords(buffer: any) {
    return lib.WordArray.create(buffer);
}