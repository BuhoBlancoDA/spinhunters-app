import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            SpinHunters
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-5">
            Welcome to the SpinHunters membership portal
          </p>
        </div>
        
        <div className="mt-10 flex flex-col space-y-4">
          <Link href="/login" className="btn-primary text-center">
            Login
          </Link>
          <Link href="/register" className="btn-secondary text-center">
            Register
          </Link>
          <p className="text-center text-sm text-gray-600 mt-5">
            Access your membership dashboard and exclusive content
          </p>
        </div>
      </div>
    </div>
  )
}