import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
const moment = require('moment-timezone')
const axios = require('axios')
const QRCode = require('qrcode.react')

export default function Account() {
    const [user, setUser] = useState("")
    const [encryptionKey, setEncryptionKey] = useState("")
    const [session, setSession] = useState("")
    const [parsedSession, setParsedSession] = useState("")
    const [sessionExpiration, setSessionExpiration] = useState(0)
    const [cacheSize, setCacheSize] = useState(0)
    const [TOTP, setTOTP] = useState("")
    const [TOTPURI, setTOTPURI] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()

    async function getTOTP() {
        var username = localStorage.getItem("USERNAME")
        var session = localStorage.getItem("SESSION_TOKEN")
        var response = await axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user/totp?username=" + username, { headers: { "Authorization": "Bearer " + session } })
        if (response.data.success) {
            if (response.data.enabled) {
                setTOTP(response.data.totp)
                setTOTPURI(response.data.totp_uri)
            } else {
                setTOTP("")
                setTOTPURI("")
            }
        } else {
            alert("Error: Unable to load 2FA information")
        }
    }

    async function enableTOTP() {
        setIsLoading(true)
        var username = localStorage.getItem("USERNAME")
        var session = localStorage.getItem("SESSION_TOKEN")
        var response = await axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user/totp/enable?username=" + username, { headers: { "Authorization": "Bearer " + session } })
        if (response.data.success) {
            setTOTP(response.data.totp)
            setTOTPURI(response.data.totp_uri)
        } else {
            alert("Error: Unable to load 2FA information")
        }
        setIsLoading(false)
    }

    async function disableTOTP() {
        setIsLoading(true)
        var username = localStorage.getItem("USERNAME")
        var session = localStorage.getItem("SESSION_TOKEN")
        var response = await axios.get(process.env.NEXT_PUBLIC_0XNOTES_HOST + "/api/v1/user/totp/disable?username=" + username, { headers: { "Authorization": "Bearer " + session } })
        if (response.data.success) {
            setTOTP("")
            setTOTPURI("")
        } else {
            alert("Error: Unable to load 2FA information")
        }
        setIsLoading(false)
    }

    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return jsonPayload;
    };

    function clearCache() {
        localStorage.removeItem("NOTES_CACHE")
        setCacheSize(0)
    }

    async function logout() {
        if (process.browser) {
            localStorage.removeItem("SESSION_TOKEN")
            localStorage.removeItem("ENCRYPTION_TOKEN")
            localStorage.removeItem("NOTES_CACHE")
            router.push("/login")
        }
    }

    useEffect(() => {
        if (localStorage.getItem("SESSION_TOKEN")) {
            setUser(localStorage.getItem("USERNAME"))
            setEncryptionKey(localStorage.getItem("ENCRYPTION_KEY"))
            setSession(localStorage.getItem("SESSION_TOKEN"))
            setParsedSession(parseJwt(localStorage.getItem("SESSION_TOKEN")))
            setSessionExpiration(JSON.parse(parseJwt(localStorage.getItem("SESSION_TOKEN"))).exp)
            setCacheSize(localStorage.getItem("NOTES_CACHE").length)
            getTOTP()
        } else {
            router.push("/login")
        }
    }, [])

    return (
        <div>
            <Head>
                <title>Account | 0xNotes</title>
            </Head>

            <Navbar />

            <main className="text-white p-4 py-4 md:px-6 xl:px-80 flex flex-col">
                <h1 className="font-bold text-4xl my-2">{user}</h1>
                <p>For security purposes, please don&apos;t share any of this information with anyone, including us. If you have any questions, please read the <Link href="/faq"><a className="text-blue-500 text-md hover:text-blue-600">FAQ</a></Link> first before contacting us.</p>
                <h2 className="font-bold text-3xl my-2">Encryption</h2>
                <label>Encryption key (hex):</label>
                <input type="text" className="p-2 rounded-md mb-1 bg-gray-700" value={encryptionKey} disabled></input>
                <h2 className="font-bold text-3xl my-2">Authentication</h2>
                <h3 className="font-bold text-2xl my-2">Two-factor Authentication (Experimental)</h3>
                <p className="mb-2">{"Enabling two-factor authentication prevents phishing and improves your account security. If enabled, you'll need to input a 6-digit code every time you log in. Please back up the secret key in a hidden place (preferably offline). We won't be able to recover your account if you lost your secret key."}</p>
                {TOTP ? <div className="bg-gray-600 rounded-md flex flex-col p-2">
                    <p className="font-bold text-xl mx-auto mb-2">Two-factor authentication is <span className="text-green-400">enabled</span></p>
                    <button className="p-2 mx-auto rounded-md accent" onClick={(e) => {disableTOTP()}} disabled={isLoading}>Disable 2FA</button>
                    <QRCode value={TOTPURI} className="mx-auto m-4" size={256} bgColor="#00000000" fgColor="#ffffff" />
                    <input type="text" className="p-2 rounded-md bg-gray-700 mx-auto sm:w-96 w-full" value={TOTP} disabled></input>
                    <p className="mx-auto text-center mt-2">{"Scan this QR code with Google Authenticator or compatible apps. Please write down this code somewhere safe (preferably offline). You won't be able to login if you lose this code."}</p>
                </div> : <div className="bg-gray-600 rounded-md flex flex-col p-2">
                    <p className="font-bold text-xl mx-auto mb-2">Two-factor authentication is <span className="text-red-400">disabled</span></p>
                    <button className="p-2 mx-auto rounded-md accent" onClick={(e) => {enableTOTP()}} disabled={isLoading}>Enable 2FA</button>
                </div>}
                <h3 className="font-bold text-2xl my-2">Current Session</h3>
                <label>Session token (JWT):</label>
                <input type="text" className="p-2 rounded-md mb-1 bg-gray-700" value={session} disabled></input>
                <label>Session token (parsed):</label>
                <input type="text" className="p-2 rounded-md mb-1 bg-gray-700" value={parsedSession} disabled></input>
                <p>You will be logged out automatically on {moment.unix(sessionExpiration).tz(moment.tz.guess()).format("llll z")}.</p>
                <button className="p-2 my-2 mr-auto rounded-md accent hover:bg-blue-600 text-white" onClick={(e) => { logout() }}>Log out now</button>
                <h2 className="font-bold text-3xl my-2">Cache</h2>
                <p>We store some information about your notes (id, title, date modified) locally on your browser. This cache will be used before 0xNotes loads new info from the server. You can purge this cache, but it will be filled again when you open the dashboard.</p>
                <button className="p-2 my-2 mr-auto rounded-md accent hover:bg-blue-600 text-white" onClick={(e) => { clearCache() }}>Purge cache (~{cacheSize} bytes)</button>
            </main>

            <Footer />
        </div>
    )
}