import Navbar from '../components/Navbar'
import JobListing from '../components/JobListing'
import Footer from '../components/Footer'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Jobs = () => {
    const { jobs } = useContext(AppContext)

    const totalJobs = jobs.length
    const activeCompanies = [...new Set(jobs.map(job => job.companyId._id))].length

    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar />
            
            {/* Page Header */}
            <div className='bg-white border-b'>
                <div className='container 2xl:px-20 mx-auto px-4 py-8'>
                    <div className='text-center'>
                        <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                            Find Your Dream Job
                        </h1>
                        <p className='text-lg text-gray-600 mb-6'>
                            Explore {totalJobs.toLocaleString()} jobs from {activeCompanies} companies
                        </p>
                        
                        {/* Quick Stats */}
                        <div className='flex flex-wrap justify-center gap-8 text-center'>
                            <div>
                                <div className='text-2xl font-bold text-blue-600'>{totalJobs}</div>
                                <div className='text-gray-600 text-sm'>Total Jobs</div>
                            </div>
                            <div>
                                <div className='text-2xl font-bold text-green-600'>{activeCompanies}</div>
                                <div className='text-gray-600 text-sm'>Companies</div>
                            </div>
                            <div>
                                <div className='text-2xl font-bold text-purple-600'>50+</div>
                                <div className='text-gray-600 text-sm'>Categories</div>
                            </div>
                            <div>
                                <div className='text-2xl font-bold text-orange-600'>95%</div>
                                <div className='text-gray-600 text-sm'>Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <JobListing />
            <Footer />
        </div>
    )
}

export default Jobs