import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const RecruiterLogin = () => {
    const navigate = useNavigate()
    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState(false)
    const [isTextDataSubmited, setIsTextDataSubmited] = useState(false)

    const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext)

    const handleForgotPassword = () => {
        setShowRecruiterLogin(false);
        navigate('/forgot-password');
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (state == "Sign Up" && !isTextDataSubmited) {
            return setIsTextDataSubmited(true)
        }

        try {

            if (state === "Login") {

                const { data } = await axios.post(backendUrl + '/api/companies/login', { email, password })

                if (data.success) {
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken', data.token)
                    setShowRecruiterLogin(false)
                    navigate('/dashboard')
                } else {
                    toast.error(data.message)
                }

            } else {

                const formData = new FormData()
                formData.append('name', name)
                formData.append('password', password)
                formData.append('email', email)
                formData.append('image', image)

                const { data } = await axios.post(backendUrl + '/api/companies/register', formData)

                if (data.success) {
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken', data.token)
                    setShowRecruiterLogin(false)
                    navigate('/dashboard')
                } else {
                    toast.error(data.message)
                }

            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    useEffect(() => {
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return (
        <div className='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
            <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500'>
                <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
                <p className='text-sm'>Welcome back! Please sign in to continue </p>
                
                {state === "Sign Up" && isTextDataSubmited ? (
                    <div className='my-10 space-y-5'>
                        <div className='flex items-center gap-4 mb-5'>
                            <label htmlFor="image">
                                <img className='w-16 rounded-full' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                                <input onChange={e => setImage(e.target.files[0])} type="file" id='image' required accept="image/*" />
                            </label>
                            <p>Upload Company <br /> logo</p>
                        </div>
                        <button 
                            type="submit" 
                            className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors'
                            disabled={!image}
                        >
                            Create Account
                        </button>
                        {!image && (
                            <p className="text-red-500 text-sm text-center">Please upload a company logo to continue</p>
                        )}
                    </div>
                ) : (
                    <div className='my-10 space-y-5'>
                        {state === "Sign Up" && (
                            <div className='relative'>
                                <img className='absolute top-1/2 -translate-y-1/2 left-4' src={assets.person_icon} alt="" />
                                <input
                                    className='w-full pl-12 pr-4 py-3 border rounded-lg'
                                    type="text"
                                    placeholder='Company Name'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        
                        <div className='relative'>
                            <img className='absolute top-1/2 -translate-y-1/2 left-4' src={assets.email_icon} alt="" />
                            <input
                                className='w-full pl-12 pr-4 py-3 border rounded-lg'
                                type="email"
                                placeholder='Email'
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className='relative'>
                            <img className='absolute top-1/2 -translate-y-1/2 left-4' src={assets.lock_icon} alt="" />
                            <input
                                className='w-full pl-12 pr-4 py-3 border rounded-lg'
                                type="password"
                                placeholder='Password'
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {state === "Login" && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button type="submit" className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors'>
                            {state === 'Login' ? 'Login' : isTextDataSubmited ? 'Create Account' : 'Next'}
                        </button>

                        <p className='text-center mt-4'>
                            {state === "Login" ? "Don't" : "Already"} have an account?{' '}
                            <span
                                onClick={() => setState(state === "Login" ? "Sign Up" : "Login")}
                                className='text-blue-600 cursor-pointer hover:underline'
                            >
                                {state === "Login" ? "Sign Up" : "Login"}
                            </span>
                        </p>
                    </div>
                )}
                <img
                    onClick={() => setShowRecruiterLogin(false)}
                    src={assets.cross_icon}
                    className='absolute top-3 right-3 cursor-pointer'
                    alt=""
                />
            </form>
        </div>
    )
}

export default RecruiterLogin