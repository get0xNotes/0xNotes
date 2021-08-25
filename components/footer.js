import Image from 'next/image'

export default function Footer() {
    return (
        <footer className="bg-gray-700 relative pt-1">
        <div className="container mx-auto px-6">
          <div className="sm:flex">
            <div className="mt-8 sm:mb-8 sm:w-full sm:px-8 flex flex-col md:flex-row justify-between">
              <div className="mx-auto flex-1">
                <Image src="/logo/1revrev.png" alt="0xNotes footer logo" className="" width={100} height={100}/>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white mt-4 md:mt-0 mb-2">About Us</span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">About</a></span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">Terms</a></span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">Privacy</a></span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white mt-4 md:mt-0 mb-2">Resources</span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">FAQ</a></span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">GitHub</a></span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">Server Status</a></span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white mt-4 md:mt-0 mb-2">Contact Us</span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">Contact</a></span>
                <span className="my-2"><a href="#" className="text-white  text-md hover:text-blue-500">Report Bug</a></span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-white text-center w-full pb-8">
               © Copyright 2021 0xNotes
            </p>
          </div>
        </div>
      </footer>
    )
}