import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import sanitizeHtml from 'sanitize-html'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
const axios = require('axios');
const zxcvbn = require('zxcvbn');

export default function Signup() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    // Too lazy so I just copied the code from the login page
    function buffer2hex(buf) {
        return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    function setAndCheckUsername(username) {
        setUsername(username)
        var uAvailText = document.getElementById("unameavailability")

        if (username.length == 0) {
            document.getElementById("unameavailabilitydiv").style.display = "none"
        } else {
            document.getElementById("unameavailabilitydiv").style.display = "block"
        }

        uAvailText.classList.remove('text-red-500')
        uAvailText.classList.remove('text-green-500')

        if (username.length < 5) {
            uAvailText.classList.add('text-red-500')
            uAvailText.innerText = "Username must be at least 5 characters long."
            return
        }

        if (username) {
            axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user/available?username=" + username).then((response) => {
                if (response.data.available) {
                    uAvailText.innerHTML = "Username <b>" + sanitizeHtml(username, { allowedTags: [] }) + "</b> is available."
                    uAvailText.classList.add('text-green-500')
                } else {
                    uAvailText.innerHTML = "Username <b>" + sanitizeHtml(username, { allowedTags: [] }) + "</b> is not available."
                    uAvailText.classList.add('text-red-500')
                }
            }).catch((error) => {
                uAvailText.classList.add('text-red-500')
                uAvailText.innerText = "Failed to check username availability."
            })
        }

    }

    function signUp(username, password, confirm) {
        setIsLoading(true)
        if (username.length < 5) {
            alert("Error: Username must be at least 5 characters long.")
            setIsLoading(false)
            return
        }

        if (zxcvbn(password).score < 4) {
            alert("Error: Weak password, try adding symbols and numbers.")
            setIsLoading(false)
            return
        }

        if (password == confirm) {
            if (process.browser) {
                var encoder = new TextEncoder('utf-8');
                window.crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ['deriveBits']).then((key) => {
                    return window.crypto.subtle.deriveBits({ "name": "PBKDF2", "salt": encoder.encode(username), "iterations": 100000, "hash": "SHA-512" }, key, 512)
                }).then((bits) => {
                    var keys = buffer2hex(bits)
                    var a_key = keys.substr(64, 64)
                    axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user/signup?username=" + username + "&auth=" + a_key).then((response) => {
                        setIsLoading(false)
                        if (response.data.success) {
                            alert("Sign up success. You'll be redirected to the login page.")
                            router.push("/login")
                        } else {
                            alert("Error: Sign up failed.")
                        }
                    }).catch((error) => {
                        setIsLoading(false)
                        alert(error)
                    })
                })
            }
        }


    }

    function checkAndSetPassword(password) {
        var bar = document.getElementById('bar');
        if (password.length == 0) {
            document.getElementById('pstrength').style.display = "none";
        } else {
            document.getElementById('pstrength').style.display = "block";
        }
        bar.classList.remove('w-2/6')
        bar.classList.remove('w-4/6')
        bar.classList.remove('w-full')
        bar.classList.remove('bg-red-500')
        bar.classList.remove('bg-green-500')
        bar.classList.remove('bg-yellow-400')
        switch (zxcvbn(password).score) {
            case 4:
                bar.classList.add('w-full')
                bar.classList.add('bg-green-500')
            case 3:
                bar.classList.add('w-4/6')
                bar.classList.add('bg-yellow-400')
            default:
                bar.classList.add('w-2/6')
                bar.classList.add('bg-red-500')
        }
        setPassword(password)
    }

    useEffect(() => {
        if (localStorage.getItem("SESSION_TOKEN")) {
            router.push("/dash")
        }
    }, [])

    return (
        <div className="flex flex-col background absolute inset-0 text-white">
            <Head>
                <title>Sign Up | 0xNotes</title>
            </Head>
            <div>

            <Navbar />

            </div>
            <div className="flex flex-col login-card mx-auto my-auto p-6 rounded-md xl:w-1/3 md:w-2/4 w-4/5">
                <h1 className="mx-auto mb-5 sm:text-3xl text-2xl font-bold">Create your 0xNotes account</h1>
                <div className="my-5 flex flex-col">
                    <label className="mx-1">Username</label>
                    <input id="username" value={username} onChange={(e) => setAndCheckUsername(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="text" name="username" placeholder="Username"></input>
                    <div style={{ display: "none" }} id="unameavailabilitydiv" className="m-1 bg-gray-600 rounded-md p-2">
                        <span id="unameavailability"></span>
                    </div>
                    <label className="mx-1">Password</label>
                    <input id="password" value={password} onChange={(e) => checkAndSetPassword(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="password" name="password" placeholder="Password"></input>
                    <div style={{ display: "none" }} id="pstrength" className="m-1 bg-gray-600 rounded-md p-2">
                        <span>Password strength</span>
                        <div className="my-1 h-3 relative max-w-xl rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gray-200 absolute"></div>
                            <div className="h-full bg-red-500 absolute" id="bar"></div>
                        </div>
                        <span>{zxcvbn(password).feedback.warning}</span>
                    </div>
                    <label className="mx-1">Confirm password</label>
                    <input id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="password" name="confirm" placeholder="Confirm password"></input>
                    <div style={{ display: password != confirm ? "block" : "none" }} className="m-1 p-2 bg-gray-600 rounded-md">
                        <span className="mx-1 text-red-500">Passwords do not match.</span>
                    </div>
                </div>
                <button disabled={isLoading ? true : false} className="accent mt-1 mx-1 p-2 rounded-md" onClick={(e) => signUp(username, password, confirm)}>{isLoading ? "Loading..." : "Sign Up"}</button>

                <span className="mx-auto mt-5">
                    <span>Already registered? </span>
                    <Link href="/login">
                        <a className="text-blue-500 hover:underline">Login here</a>
                    </Link>.
                </span>
            </div>
            <Footer/>
        </div>
    )
}