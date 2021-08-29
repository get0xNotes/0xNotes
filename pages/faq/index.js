import Head from 'next/head'
import Footer from '../../components/footer'
import Navbar from '../../components/navbar'

export default function faq() {
    return (
        <div>
            <Head>
                <title>FAQ | 0xNotes</title>
            </Head>

            <Navbar/>

            <main className="text-white p-4 py-4 md:px-6 xl:px-80 flex flex-col">
                <h1 className="font-bold text-4xl my-2">Frequently Asked Questions</h1>
                <h2 className="font-bold text-2xl my-2">What is 0xNotes? Never heard of that.</h2>
                <p>0xNotes is an open-source, end-to-end encrypted note-taking app. End-to-end encryption ensures that only you can read your notes, not hackers, not even us. It’s somewhat similar to Notion (except for the pages), so you can add images, tables, code, to-do list, embed YouTube, and more. 0xNotes is developed by <a href="https://brianthe.dev" className="text-blue-500  text-md hover:text-blue-600">brian-the-dev</a> and <a href="https://thriveshadow.com" className="text-blue-500  text-md hover:text-blue-600">ThriveShadow</a> for a computer science competition.</p>
                <h2 className="font-bold text-2xl my-2">How secure is the encryption?</h2>
                <p>A 256-bit encryption key is derived from your password using PBKDF2 (512-bit, salted, 100,000 iterations). Every note and title is encrypted separately with AES-CTR using that encryption key and a random 8-byte nonce. Unless your password is weak, a hacker would need to try 2^256 combinations. To visualize this, 3b1b has a video about 256-bit security:</p>
                <iframe className="mx-auto my-2" width="560" height="315" src="https://www.youtube-nocookie.com/embed/S9JGmA5_unY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <h2 className="font-bold text-2xl my-2">Is it safe to store my password on 0xNotes?</h2>
                <p>Actually, we don't store your password. As stated above, we use PBKDF2 to generate a 512-bit hash. The first 256-bit is your encryption key, while the last 256-bit is your authentication key. The authentication key is transported and stored securely in our database.</p>
                <h2 className="font-bold text-2xl my-2">Why can't I use my email to register?</h2>
                <p>0xNotes doesn't collect your email address to protect your privacy.</p>
                <h2 className="font-bold text-2xl my-2">Why is it named 0xNotes?</h2>
                <p>For some programming languages, hexadecimal is often prefixed with "0x". Although 0xNotes isn't valid hexadecimal, we think it's a simple and perfect name for our app.</p>
                <h2 className="font-bold text-2xl my-2">Can I contribute?</h2>
                <p>That would be great! Just head over to our <a href="https://github.com/brian-the-dev/0xNotes/" className="text-blue-500  text-md hover:text-blue-600">GitHub page</a>. Make sure to read the guidelines and the code of conduct.</p>
                <h2 className="font-bold text-2xl my-2">Can I change my password?</h2>
                <p>Currently, you can't change your password because the encryption key will change. This means that all of your notes must be downloaded and encrypted with your new password.</p>
                <h2 className="font-bold text-2xl my-2">I found a bug. What should I do?</h2>
                <p>Please check if the bug is already reported. If not, you may create an issue on our <a href="https://github.com/brian-the-dev/0xNotes/issues" className="text-blue-500  text-md hover:text-blue-600">GitHub page</a>.</p>
            </main>

            <Footer/>
        </div>
    )
}