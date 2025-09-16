import { useContext, useRef, useState } from 'react'
import { assets, JobCategories } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const { setSearchFilter, setIsSearched, jobs } = useContext(AppContext)
    const [activeCategory, setActiveCategory] = useState('')

    const titleRef = useRef(null)
    const locationRef = useRef(null)
    const experienceRef = useRef(null)

    const onSearch = () => {
        setSearchFilter({
            title: titleRef.current.value,
            location: locationRef.current.value,
            experience: experienceRef.current.value
        })
        setIsSearched(true)
        // Scroll to job listings
        setTimeout(() => {
            document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleCategoryClick = (category) => {
        setActiveCategory(category)
        setSearchFilter({
            title: category,
            location: '',
            experience: ''
        })
        setIsSearched(true)
        setTimeout(() => {
            document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const totalJobs = jobs.length
    const activeCompanies = [...new Set(jobs.map(job => job.companyId._id))].length

    return (
        <div className='bg-gradient-to-br from-blue-50 via-white to-purple-50'>
            <div className='container 2xl:px-20 mx-auto py-12'>
                {/* Main Hero Section */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6'>
                        Find Your <span className='text-blue-600'>Dream Job</span> Today
                    </h1>
                    <p className='text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-4'>
                        Discover thousands of job opportunities from top companies. Your next career move is just a click away.
                    </p>

                    {/* Statistics */}
                    <div className='flex flex-wrap justify-center gap-8 mb-10 text-center'>
                        <div className='bg-white rounded-lg p-4 shadow-md min-w-[120px]'>
                            <div className='text-2xl font-bold text-blue-600'>{totalJobs.toLocaleString()}+</div>
                            <div className='text-gray-600 text-sm'>Active Jobs</div>
                        </div>
                        <div className='bg-white rounded-lg p-4 shadow-md min-w-[120px]'>
                            <div className='text-2xl font-bold text-green-600'>{activeCompanies}+</div>
                            <div className='text-gray-600 text-sm'>Companies</div>
                        </div>
                        <div className='bg-white rounded-lg p-4 shadow-md min-w-[120px]'>
                            <div className='text-2xl font-bold text-purple-600'>50+</div>
                            <div className='text-gray-600 text-sm'>Job Categories</div>
                        </div>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className='bg-white rounded-2xl shadow-2xl p-6 mx-2 max-w-4xl mx-auto'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                            {/* Job Title Search */}
                            <div className='space-y-2'>
                                <label className='text-sm font-medium text-gray-700'>Job Title / Skills</label>
                                <div className='relative'>
                                    <img className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5' src={assets.search_icon} alt="" />
                                    <input 
                                        type="text"
                                        placeholder='e.g. Software Engineer'
                                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        ref={titleRef}
                                    />
                                </div>
                            </div>

                            {/* Location Search */}
                            <div className='space-y-2'>
                                <label className='text-sm font-medium text-gray-700'>Location</label>
                                <div className='relative'>
                                    <img className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5' src={assets.location_icon} alt="" />
                                    <input 
                                        type="text"
                                        placeholder='e.g. Bangalore'
                                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        ref={locationRef}
                                    />
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div className='space-y-2'>
                                <label className='text-sm font-medium text-gray-700'>Experience</label>
                                <div className='relative'>
                                    <img className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5' src={assets.person_icon} alt="" />
                                    <select 
                                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white'
                                        ref={experienceRef}
                                    >
                                        <option value="">Any Experience</option>
                                        <option value="Fresher">Fresher (0-1 years)</option>
                                        <option value="Junior">Junior (1-3 years)</option>
                                        <option value="Mid">Mid-level (3-5 years)</option>
                                        <option value="Senior">Senior (5+ years)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button 
                                onClick={onSearch} 
                                className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl'
                            >
                                Search Jobs
                            </button>
                        </div>

                        {/* Quick Search Suggestions */}
                        <div className='mt-6'>
                            <p className='text-sm text-gray-600 mb-3'>Trending Searches:</p>
                            <div className='flex flex-wrap gap-2'>
                                {['Remote Jobs', 'Data Scientist', 'Frontend Developer', 'Product Manager', 'UI/UX Designer'].map((suggestion, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => {
                                            titleRef.current.value = suggestion;
                                            onSearch();
                                        }}
                                        className='px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition duration-200'
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Categories */}
                <div className='mb-12'>
                    <h2 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8'>
                        Explore Jobs by <span className='text-blue-600'>Category</span>
                    </h2>
                    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 px-4'>
                        {JobCategories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => handleCategoryClick(category)}
                                className={`p-4 rounded-xl border-2 transition duration-300 hover:shadow-lg ${
                                    activeCategory === category 
                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                }`}
                            >
                                <div className='text-2xl mb-2'>
                                    {index === 0 && '💻'}
                                    {index === 1 && '📊'}
                                    {index === 2 && '🎨'}
                                    {index === 3 && '🌐'}
                                    {index === 4 && '📈'}
                                    {index === 5 && '📱'}
                                    {index === 6 && '🔒'}
                                </div>
                                <div className='text-sm font-medium'>{category}</div>
                                <div className='text-xs text-gray-500 mt-1'>
                                    {jobs.filter(job => job.category === category).length} jobs
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trusted Companies */}
                <div className='bg-white rounded-2xl shadow-lg p-8 mx-2'>
                    <h3 className='text-xl font-semibold text-center text-gray-800 mb-6'>
                        Trusted by Leading Companies
                    </h3>
                    <div className='flex justify-center items-center gap-8 lg:gap-12 flex-wrap opacity-70 hover:opacity-100 transition duration-300'>
                        <img className='h-8 md:h-10 grayscale hover:grayscale-0 transition duration-300' src={assets.microsoft_logo} alt="Microsoft" />
                        <img className='h-8 md:h-10 grayscale hover:grayscale-0 transition duration-300' src={assets.walmart_logo} alt="Walmart" />
                        <img className='h-8 md:h-10 grayscale hover:grayscale-0 transition duration-300' src={assets.accenture_logo} alt="Accenture" />
                        <img className='h-8 md:h-10 grayscale hover:grayscale-0 transition duration-300' src={assets.samsung_logo} alt="Samsung" />
                        <img className='h-8 md:h-10 grayscale hover:grayscale-0 transition duration-300' src={assets.amazon_logo} alt="Amazon" />
                        <img className='h-8 md:h-10 grayscale hover:grayscale-0 transition duration-300' src={assets.adobe_logo} alt="Adobe" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero