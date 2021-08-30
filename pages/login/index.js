import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
const axios = require('axios');

export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [twoFA, setTwoFA] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    function buffer2hex(buf) {
        return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    async function getSessionToken(auth_key) {
        var username = localStorage.getItem("USERNAME")
        var longsession = document.getElementById("longsession").checked ? 1 : 0
        try {
            var response = await axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user/session?auth=" + auth_key + "&username=" + username + "&long_session=" + longsession + "&2fa=" + twoFA)
            if (response.data.session) {
                localStorage.setItem("SESSION_TOKEN", response.data.jwt)
                router.push("/dash")
            } else {
                localStorage.removeItem("ENCRYPTION_KEY")
                alert("Error: " + response.data.error)
            }
        } catch (error) {
            alert("Error: Something wrong with the server.")
            console.log(error)
        }
        setIsLoading(false)
    }

    async function login(username, password) {
        setIsLoading(true)
        if (username && password && process.browser) {
            var encoder = new TextEncoder('utf-8');
            var key = await window.crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ['deriveBits'])
            var bits = await window.crypto.subtle.deriveBits({ "name": "PBKDF2", "salt": encoder.encode(username), "iterations": 100000, "hash": "SHA-512" }, key, 512)

            var keys = buffer2hex(bits)
            var e_key = keys.substr(0, 64)
            var a_key = keys.substr(64, 64)
            localStorage.setItem("USERNAME", username)
            localStorage.setItem("ENCRYPTION_KEY", e_key)
            await getSessionToken(a_key)
        } else {
            alert("Username and password are required.")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (localStorage.getItem("USERNAME")) {
            document.getElementById("username").value = localStorage.getItem("USERNAME")
            setUsername(localStorage.getItem("USERNAME"))
        }

        if (localStorage.getItem("SESSION_TOKEN")) {
            router.push("/dash")
        }
    }, [])

    return (
        <div className="flex flex-col background absolute inset-0 text-white">
            <Head>
                <title>Login | 0xNotes</title>
            </Head>

            <Navbar />

            <div className="flex flex-col login-card mx-auto my-auto p-6 rounded-md xl:w-3/12 md:w-2/4 w-4/5">
                <h1 className="mx-auto mb-5 sm:text-3xl text-2xl font-bold">Login to 0xNotes</h1>
                <div className="my-5 flex flex-col">
                    <label className="mx-1">Username</label>
                    <input id="username" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^0-9a-zA-Z_\-.]/g, '').toLowerCase())} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="text" name="username" placeholder="Username"></input>
                    <label className="mx-1">Password</label>
                    <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="password" name="password" placeholder="Password"></input>
                    <label className="mx-1">2FA (if enabled)</label>
                    <input id="2fa" value={twoFA} onChange={(e) => setTwoFA(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="text" name="2fa" placeholder="2FA (if enabled)"></input>
                    <div className="mx-1 mt-1">
                        <input id="longsession" value="1" type="checkbox"></input>
                        <label htmlFor="longsession" className="ml-1">Keep me logged in for a week.</label>
                    </div>
                </div>
                <button disabled={isLoading ? true : false} className="accent mt-1 mx-1 p-2 rounded-md" onClick={(e) => login(username, password)}>{isLoading ? "Loading..." : "Login"}</button>

                <span className="mx-auto mt-5">
                    <span>New user? </span>
                    <Link href="/signup">
                        <a className="text-blue-500 hover:underline">Create an account</a>
                    </Link>.
                </span>
            </div>
            <Footer />
        </div>
    )
}