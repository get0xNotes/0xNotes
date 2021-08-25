import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        if (localStorage.getItem("ENCRYPTION_KEY") && localStorage.getItem("SESSION_TOKEN") && localStorage.getItem("USERNAME")) {
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
        }
    }, [])

    return (
        <header className="flex p-4 w-full text-white bg-gray-700">
            <Link href="/">
                <a className="my-auto flex">
                    <Image src="/logo/2rev.png" alt="0xNotes header logo" width={30} height={30} className="h-8 my-auto mx-1" />
                    <span className="my-auto text-2xl mx-1">0xNotes</span>
                </a>
            </Link>
            <div style={{ display: isLoggedIn ? 'none' : 'block' }} className="ml-auto">
                <Link href="/login">
                    <a className="mx-1">Login</a>
                </Link>
                <Link href="/signup">
                    <button className="accent my-auto mx-1 px-2 py-1 rounded-md">Sign Up</button>
                </Link>
            </div>
            <div style={{ display: isLoggedIn ? 'block' : 'none' }} className="ml-auto">
                <Link href="/dash">
                    <button className="accent my-auto mx-1 px-2 py-1 rounded-md">Dashboard</button>
                </Link>
            </div>
        </header>
    )
}