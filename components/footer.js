import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative h-0">
      <div className="bg-gray-700 pt-1">
        <div className="container mx-auto px-6 bg-gray-700">
          <div className="sm:flex">
            <div className="mt-8 sm:mb-8 sm:w-full sm:px-8 flex flex-col md:flex-row justify-between">
              <div className="mx-auto flex-1">
                <Image src="/logo/1revrev.png" alt="0xNotes footer logo" className="" width={100} height={100} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white mt-4 md:mt-0 mb-2">About Us</span>
                <span className="my-2"><Link href="/about"><a className="text-white  text-md hover:text-blue-500">About</a></Link></span>
                <span className="my-2"><Link href="/terms"><a className="text-white  text-md hover:text-blue-500">Terms</a></Link></span>
                <span className="my-2"><Link href="/privacy"><a className="text-white  text-md hover:text-blue-500">Privacy</a></Link></span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white mt-4 md:mt-0 mb-2">Resources</span>
                <span className="my-2"><Link href="/faq"><a className="text-white  text-md hover:text-blue-500">FAQ</a></Link></span>
                <span className="my-2"><a href="https://github.com/brian-the-dev/0xNotes" className="text-white  text-md hover:text-blue-500">GitHub</a></span>
                <span className="my-2"><a href="https://stats.uptimerobot.com/zljp1HR5Dq/789017929" className="text-white  text-md hover:text-blue-500">Server Status</a></span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white mt-4 md:mt-0 mb-2">Contact Us</span>
                <span className="my-2"><a href="mailto:contact@0xnotes.me" className="text-white  text-md hover:text-blue-500">Contact</a></span>
                <span className="my-2"><a href="https://github.com/brian-the-dev/0xNotes/issues" className="text-white  text-md hover:text-blue-500">Report Bug</a></span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-white text-center w-full pb-8">
              © Copyright 2021 0xNotes
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}