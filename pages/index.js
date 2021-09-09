import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '../components/footer.js'
import Navbar from '../components/navbar.js'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("ENCRYPTION_KEY") && localStorage.getItem("SESSION_TOKEN") && localStorage.getItem("USERNAME")) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  return (
    <div className="text-white">
      <Head>
        <title>0xNotes | End-to-end Encrypted Note-taking App</title>
        <meta name="title" content="0xNotes | End-to-end Encrypted Note-taking App" />
        <meta name="description" content="0xNotes is an open-source note-taking app that features end-to-end encryption and user privacy protection." />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://0xnotes.me/" />
        <meta property="og:title" content="0xNotes | End-to-end Encrypted Note-taking App" />
        <meta property="og:description" content="0xNotes is an open-source note-taking app that features end-to-end encryption and user privacy protection." />
        <meta property="og:image" content="" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://0xnotes.me/" />
        <meta property="twitter:title" content="0xNotes | End-to-end Encrypted Note-taking App" />
        <meta property="twitter:description" content="0xNotes is an open-source note-taking app that features end-to-end encryption and user privacy protection." />
        <meta property="twitter:image" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="xl:p-14 md:p-10 p-4">
        <div className="flex sm:flex-row-reverse flex-col">
          <div className="block flex-1 mx-auto sm:w-2/4 w-7/12">
            <Image src="/desk.png" width="100%" height="100%" layout="responsive" />
          </div>
          <div className="flex flex-col flex-1 my-auto">
            <h1 className="py-4 font-normal 2xl:text-8xl xl:text-6xl md:text-5xl text-4xl text-center sm:text-left">0xNotes is an <b>end-to-end encrypted</b> note-taking app</h1>
            <p className="py-4 text-center sm:text-left md:text-xl">We revolutionize digital note-taking by creating 0xNotes (/nɔt ɛks nəʊts/), one of the first note-taking app to feature <b>end-to-end encryption</b>, <b>user privacy protection</b>, and it&apos;s completely <b>open-source</b>!</p>
            <div className="flex flex-row mx-auto sm:mx-0">
              <Link className="flex-1" href="/login">
                <button style={{ display: isLoggedIn ? 'none' : 'block' }} className="accent my-auto mx-1 p-2 px-6 rounded-md">Login</button>
              </Link>
              <Link className="flex-1" href="/signup">
                <button style={{ display: isLoggedIn ? 'none' : 'block' }} className="accent my-auto mx-1 p-2 px-6 rounded-md">Sign Up</button>
              </Link>
              <Link className="flex-1" href="/dash">
                <button style={{ display: isLoggedIn ? 'block' : 'none' }} className="accent my-auto mx-1 p-2 px-6 rounded-md">Go To Dashboard</button>
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
