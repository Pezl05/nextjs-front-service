'use client'
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import { login } from '@/auth';

export default function Login() {

    const [formError, setFormError] = useState({ username: false, password: false });
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleLogin(formData: FormData) {
        const errorState = { username: !formData.get('username'), password: !formData.get('password')};
        setFormError(errorState);
        if(errorState.username || errorState.password ){
            console.log(errorState)
            return;
        }

        try {
            const result = await login(formData)
            if (!result.success) {
                setError(result.message || "Invalid username or password. Please check and try again.")
                return;
            }

            router.replace('/')
        } catch (error) {
            console.log("Error: ", error)
            setError("An error occurred during login. Please try again later.")
        }

    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            <div className="bg-[url('/login.jpg')] bg-cover bg-center hidden lg:block">
        </div>

        <div className="flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src="/logo.svg" alt="Logo Login" className="h-48 w-auto" />
                </div>
                <h1 className="text-4xl font-bold text-center mb-6">Sign in to your account</h1>
                
                <form className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.target as HTMLFormElement)
                        handleLogin(formData)
                }} >
                    <div>
                        <label htmlFor="username" className="flex items-center justify-between">
                            <div className="block text-sm/6 font-semibold text-gray-700">
                                Username or Email
                            </div>
                            { formError.username && (  
                                <div className="block text-sm/6 font-semibold text-red-600">
                                        Please enter your username.
                                </div>
                            )}
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                                    ${formError.username ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                placeholder="Enter your username or email"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="flex items-center justify-between">
                            <div className="block text-sm/6 font-semibold text-gray-700">
                                Password
                            </div>
                            { formError.password && (  
                                <div className="block text-sm/6 font-semibold text-red-600">
                                        Please enter your password.
                                </div>
                            )}
                        </label>
                        <div className="mt-2">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                                    ${formError.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Sign In
                        </button>
                    </div>
                    { error && (
                        <div className="text-red-500 font-bold text-center">
                            { error }
                        </div>
                    )}
                </form>
                </div>
            </div>
        </div>
    );
}