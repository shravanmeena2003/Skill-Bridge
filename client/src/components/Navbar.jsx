import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

    const { openSignIn } = useClerk()
    const { user } = useUser()
    const navigate = useNavigate()
    const { setShowRecruiterLogin } = useContext(AppContext)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className='sticky top-0 z-50 bg-white shadow-sm border-b'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center py-4'>
                {/* Logo */}
                <div className='flex items-center space-x-8'>
                    <img 
                        onClick={() => navigate('/')} 
                        className='cursor-pointer h-10' 
                        src={assets.logo} 
                        alt="SkillBridge" 
                    />
                    
                    {/* Navigation Links - Desktop */}
                    <nav className='hidden md:flex items-center space-x-6'>
                        <Link to='/jobs' className='text-gray-700 hover:text-blue-600 transition-colors font-medium'>
                            Jobs
                        </Link>
                        <Link to='/companies' className='text-gray-700 hover:text-blue-600 transition-colors font-medium'>
                            Companies
                        </Link>
                        <Link to='/services' className='text-gray-700 hover:text-blue-600 transition-colors font-medium'>
                            Services
                        </Link>
                    </nav>
                </div>

                {/* Right Side - Desktop */}
                <div className='hidden md:flex items-center space-x-4'>
                    {user ? (
                        <div className='flex items-center space-x-4'>
                            <Link 
                                to='/applications' 
                                className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                            >
                                My Applications
                            </Link>
                            <Link 
                                to='/saved-jobs' 
                                className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                            >
                                Saved Jobs
                            </Link>
                            <Link 
                                to='/profile' 
                                className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                            >
                                Profile
                            </Link>
                            <div className='h-6 w-px bg-gray-300'></div>
                            <div className='flex items-center space-x-3'>
                                <span className='text-gray-700 text-sm'>
                                    Hi, {user.firstName}
                                </span>
                                <UserButton 
                                    appearance={{
                                        elements: {
                                            avatarBox: "h-8 w-8"
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center space-x-3'>
                            <button 
                                onClick={() => setShowRecruiterLogin(true)} 
                                className='text-gray-600 hover:text-gray-800 transition-colors font-medium'
                            >
                                For Employers
                            </button>
                            <div className='h-6 w-px bg-gray-300'></div>
                            <button 
                                onClick={() => openSignIn()} 
                                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                            >
                                Sign In
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className='md:hidden p-2'
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <div className='space-y-1'>
                        <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className='md:hidden bg-white border-t'>
                    <div className='container px-4 py-4 space-y-4'>
                        <Link 
                            to='/jobs' 
                            className='block text-gray-700 hover:text-blue-600 transition-colors font-medium'
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Jobs
                        </Link>
                        <Link 
                            to='/companies' 
                            className='block text-gray-700 hover:text-blue-600 transition-colors font-medium'
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Companies
                        </Link>
                        <Link 
                            to='/services' 
                            className='block text-gray-700 hover:text-blue-600 transition-colors font-medium'
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Services
                        </Link>
                        
                        {user ? (
                            <div className='space-y-4 pt-4 border-t'>
                                <Link 
                                    to='/applications' 
                                    className='block text-gray-700 hover:text-blue-600 transition-colors font-medium'
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Applications
                                </Link>
                                <Link 
                                    to='/saved-jobs' 
                                    className='block text-gray-700 hover:text-blue-600 transition-colors font-medium'
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Saved Jobs
                                </Link>
                                <Link 
                                    to='/profile' 
                                    className='block text-gray-700 hover:text-blue-600 transition-colors font-medium'
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <div className='flex items-center space-x-3'>
                                    <span className='text-gray-700 text-sm'>
                                        Hi, {user.firstName}
                                    </span>
                                    <UserButton />
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-3 pt-4 border-t'>
                                <button 
                                    onClick={() => {
                                        setShowRecruiterLogin(true)
                                        setIsMenuOpen(false)
                                    }} 
                                    className='block w-full text-left text-gray-600 hover:text-gray-800 transition-colors font-medium'
                                >
                                    For Employers
                                </button>
                                <button 
                                    onClick={() => {
                                        openSignIn()
                                        setIsMenuOpen(false)
                                    }} 
                                    className='block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center'
                                >
                                    Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar