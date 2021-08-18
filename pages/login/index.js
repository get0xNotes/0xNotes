import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
const axios = require('axios');

export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    function buffer2hex(buf) {
        return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    function derive_and_set_key(username, password) {
        if (process.browser) {
            var encoder = new TextEncoder('utf-8');
            window.crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ['deriveBits']).then((key) => {
                return window.crypto.subtle.deriveBits({ "name": "PBKDF2", "salt": encoder.encode(username), "iterations": 100000, "hash": "SHA-512" }, key, 512)
            }).then((bits) => {
                var keys = buffer2hex(bits)
                var e_key = keys.substr(0, 64)
                var a_key = keys.substr(64, 64)
                localStorage.setItem("user", username)
                localStorage.setItem("e_key", e_key)
                localStorage.setItem("a_key", a_key)
            })
        }
    }

    function checkUserAuthentication() {
        var a_key = localStorage.getItem("a_key")
        var username = localStorage.getItem("user")
        axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user?auth=" + a_key + "&username=" + username).then((response) => {
            console.log(response.data)
            if (response.data.authenticated) {
                router.push("/dash")
            } else {
                alert("Invalid username or password")
            }
            setIsLoading(false)
        }).catch((error) => {
            alert(error)
            setIsLoading(false)
        })
        
    }

    function login(username, password) {
        setIsLoading(true)
        if (username && password) {
            setIsLoading(true)
            derive_and_set_key(username, password)
            setTimeout(() => {
                checkUserAuthentication()
            }, 100)
        } else {
            alert("Username and password are required.")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (localStorage.getItem("user")) {
            document.getElementById("username").value = localStorage.getItem("user")
            setUsername(localStorage.getItem("user"))
        }

        if (localStorage.getItem("e_key") && localStorage.getItem("a_key") && localStorage.getItem("user")) {
            checkUserAuthentication()
        }
    }, [])

    return (
        <div className="flex flex-col background absolute inset-0 text-white">
            <Head>
                <title>Login | 0xNotes</title>
            </Head>
            <div>

            </div>
            <div className="flex flex-col login-card m-auto p-6 rounded-md xl:w-3/12 md:w-2/4 w-4/5">
                <h1 className="mx-auto mb-5 sm:text-3xl text-2xl font-bold">Login to 0xNotes</h1>
                <div className="my-5 flex flex-col">
                    <label className="mx-1">Username</label>
                    <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="text" name="username" placeholder="Username"></input>
                    <label className="mx-1">Password</label>
                    <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mx-auto w-full p-2 rounded-md border-4 border-gray-800 text-black" type="password" name="password" placeholder="Password"></input>
                </div>
                <button disabled={isLoading ? true : false} className="accent mt-1 mx-1 p-2 rounded-md" onClick={(e) => login(username, password)}>{isLoading ? "Loading..." : "Login"}</button>

                <span className="mx-auto mt-5">
                    <span>New user? </span>
                    <Link href="/signup">
                        <a className="text-blue-500 hover:underline">Create an account</a>
                    </Link>.
                </span>
            </div>
            <footer className="p-4 w-screen bg-gray-700">&copy; Copyright 2021 0xNotes &#183; GitHub &#183; Terms &#183; Privacy</footer>
        </div>
    )
}