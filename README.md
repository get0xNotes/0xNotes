# 0xNotes
End-to-end encrypted collaborative note-taking app for the era of privacy concern.

![0xnotes-dash](https://user-images.githubusercontent.com/40331046/201464847-ad18acc1-3074-4e71-b2a4-8b0162cc2764.png)

We recommend self-hosting the app through Docker. Deploy to Cloudflare Pages, Vercel, and Netlify at your own risk. Requires the [Socket.IO server](https://github.com/get0xNotes/socket) to work.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fget0xNotes%2F0xNotes&env=POSTGREST_URL,POSTGREST_KEY,SERVER_JWK,SOCKET_URL&envDescription=URL%20and%20API%20key%20for%20Supabase%20or%20Postgres.%20JWK%20in%20JSON%20using%20the%20EdDSA%20algorithm.&demo-title=0xNotes&demo-description=End-to-End%20Encrypted%20Collaborative%20Note-taking%20App&demo-url=https%3A%2F%2F0xnotes.me)
[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/get0xNotes/0xNotes)

## Features
- Secure AES-256 GCM encryption
- X25519 key exchange
- Collaborate in real-time through Socket.IO

## License

[MIT License](https://github.com/get0xNotes/frontend/blob/svelte/LICENSE)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
