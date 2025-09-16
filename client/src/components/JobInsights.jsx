import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import React from 'react';
import { assets } from '../assets/assets';
import { formatSalaryToLPA } from '../utils/formatSalary';

const JobInsights = () => {
    const { jobs } = useContext(AppContext)

    const totalJobs = jobs.length
    const activeCompanies = [...new Set(jobs.map(job => job.companyId._id))].length
    const remoteJobs = jobs.filter(job => job.remote).length
    const averageSalary = jobs.reduce((acc, job) => acc + job.salary, 0) / jobs.length

    const topCategories = jobs.reduce((acc, job) => {
        acc[job.category] = (acc[job.category] || 0) + 1
        return acc
    }, {})

    const topCategoriesList = Object.entries(topCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)

    return (
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 py-16'>
            <div className='container 2xl:px-20 mx-auto px-4'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
                        Job Market <span className='text-blue-600'>Insights</span>
                    </h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Get insights into the current job market trends and opportunities
                    </p>
                </div>

                {/* Statistics Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
                    <div className='bg-white rounded-xl p-6 shadow-lg text-center'>
                        <div className='text-3xl font-bold text-blue-600 mb-2'>
                            {totalJobs.toLocaleString()}+
                        </div>
                        <div className='text-gray-600'>Total Jobs</div>
                        <div className='text-sm text-gray-500 mt-2'>Updated daily</div>
                    </div>

                    <div className='bg-white rounded-xl p-6 shadow-lg text-center'>
                        <div className='text-3xl font-bold text-green-600 mb-2'>
                            {activeCompanies}+
                        </div>
                        <div className='text-gray-600'>Active Companies</div>
                        <div className='text-sm text-gray-500 mt-2'>Hiring now</div>
                    </div>

                    <div className='bg-white rounded-xl p-6 shadow-lg text-center'>
                        <div className='text-3xl font-bold text-purple-600 mb-2'>
                            {remoteJobs}+
                        </div>
                        <div className='text-gray-600'>Remote Jobs</div>
                        <div className='text-sm text-gray-500 mt-2'>Work from anywhere</div>
                    </div>

                    <div className='bg-white rounded-xl p-6 shadow-lg text-center'>
                        <div className='text-3xl font-bold text-orange-600 mb-2'>
                            {formatSalaryToLPA(averageSalary)}
                        </div>
                        <div className='text-gray-600'>Average Salary</div>
                        <div className='text-sm text-gray-500 mt-2'>Per annum</div>
                    </div>
                </div>

                {/* Top Categories */}
                <div className='bg-white rounded-xl p-8 shadow-lg'>
                    <h3 className='text-xl font-semibold text-gray-800 mb-6'>Top Hiring Categories</h3>
                    <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                        {topCategoriesList.map(([category, count], index) => (
                            <div key={category} className='text-center p-4 rounded-lg bg-gray-50'>
                                <div className='text-2xl mb-2'>
                                    {index === 0 && '💻'}
                                    {index === 1 && '📊'}
                                    {index === 2 && '🎨'}
                                    {index === 3 && '🌐'}
                                    {index === 4 && '📈'}
                                </div>
                                <div className='font-semibold text-gray-800'>{category}</div>
                                <div className='text-sm text-gray-600'>{count} jobs</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobInsights