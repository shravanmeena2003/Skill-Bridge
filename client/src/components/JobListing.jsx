import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import JobCard from './JobCard'
import AdvancedFilters from './AdvancedFilters'

const JobListing = () => {

    const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext)

    const [showFilter, setShowFilter] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])
    const [advancedFilters, setAdvancedFilters] = useState(null)
    const [sortBy, setSortBy] = useState('relevant')

    const [filteredJobs, setFilteredJobs] = useState(jobs)

    const handleCategoryChange = (category) => {
        setSelectedCategories(
            prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        )
    }

    const handleLocationChange = (location) => {
        setSelectedLocations(
            prev => prev.includes(location) ? prev.filter(c => c !== location) : [...prev, location]
        )
    }

    const handleAdvancedFilters = (filters) => {
        setAdvancedFilters(filters)
        setShowFilter(false) // Hide mobile filter panel
    }

    const applyAllFilters = (jobsToFilter) => {
        let filtered = jobsToFilter

        // Basic filters
        const matchesCategory = job => selectedCategories.length === 0 || selectedCategories.includes(job.category)
        const matchesLocation = job => selectedLocations.length === 0 || selectedLocations.includes(job.location)
        const matchesTitle = job => searchFilter.title === "" || job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
        const matchesSearchLocation = job => searchFilter.location === "" || job.location.toLowerCase().includes(searchFilter.location.toLowerCase())
        const matchesExperience = job => searchFilter.experience === "" || job.level.toLowerCase().includes(searchFilter.experience.toLowerCase())

        filtered = filtered.filter(job => 
            matchesCategory(job) && 
            matchesLocation(job) && 
            matchesTitle(job) && 
            matchesSearchLocation(job) && 
            matchesExperience(job)
        )

        // Advanced filters
        if (advancedFilters) {
            // Filter by categories from advanced filters
            if (advancedFilters.categories.length > 0) {
                filtered = filtered.filter(job => advancedFilters.categories.includes(job.category))
            }

            // Filter by locations from advanced filters
            if (advancedFilters.locations.length > 0) {
                filtered = filtered.filter(job => advancedFilters.locations.includes(job.location))
            }

            // Filter by experience levels
            if (advancedFilters.experienceLevels.length > 0) {
                filtered = filtered.filter(job => advancedFilters.experienceLevels.includes(job.level))
            }

            // Filter by salary range
            if (advancedFilters.salaryRange.min || advancedFilters.salaryRange.max) {
                const min = parseInt(advancedFilters.salaryRange.min) || 0
                const max = parseInt(advancedFilters.salaryRange.max) || Infinity
                filtered = filtered.filter(job => job.salary >= min && job.salary <= max)
            }

            // Filter by posted within
            if (advancedFilters.postedWithin) {
                const days = parseInt(advancedFilters.postedWithin)
                const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
                filtered = filtered.filter(job => job.date >= cutoffDate)
            }

            // Filter by skills (search in job title and description)
            if (advancedFilters.skills.length > 0) {
                filtered = filtered.filter(job => {
                    const jobText = (job.title + ' ' + job.description + ' ' + job.category).toLowerCase()
                    return advancedFilters.skills.some(skill => 
                        jobText.includes(skill.toLowerCase())
                    )
                })
            }
        }

        return filtered
    }

    const sortJobs = (jobs) => {
        switch (sortBy) {
            case 'recent':
                return [...jobs].sort((a, b) => b.date - a.date)
            case 'salary-high':
                return [...jobs].sort((a, b) => b.salary - a.salary)
            case 'salary-low':
                return [...jobs].sort((a, b) => a.salary - b.salary)
            case 'relevant':
            default:
                return jobs
        }
    }

    useEffect(() => {
        const filtered = applyAllFilters(jobs.slice().reverse())
        const sorted = sortJobs(filtered)
        setFilteredJobs(sorted)
        setCurrentPage(1)
    }, [jobs, selectedCategories, selectedLocations, searchFilter, advancedFilters, sortBy])

    const getActiveFiltersCount = () => {
        let count = selectedCategories.length + selectedLocations.length
        if (advancedFilters) {
            count += advancedFilters.categories.length + 
                     advancedFilters.locations.length + 
                     advancedFilters.experienceLevels.length +
                     advancedFilters.jobTypes.length +
                     advancedFilters.workModes.length +
                     advancedFilters.skills.length +
                     (advancedFilters.salaryRange.min || advancedFilters.salaryRange.max ? 1 : 0) +
                     (advancedFilters.postedWithin ? 1 : 0)
        }
        return count
    }

    return (
        <div className='bg-gray-50 py-12'>
            <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8'>

                {/* Sidebar */}
                <div className='w-full lg:w-1/4 lg:pr-8'>
                    <div className='sticky top-24'>
                        {/*  Search Filter from Hero Component */}
                        {
                            isSearched && (searchFilter.title !== "" || searchFilter.location !== "" || searchFilter.experience !== "") && (
                                <div className='bg-white rounded-lg p-4 mb-6 shadow-sm'>
                                    <h3 className='font-medium text-lg mb-4'>Current Search</h3>
                                    <div className='space-y-2'>
                                        {searchFilter.title && (
                                            <span className='inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-lg text-sm'>
                                                <span>Title: {searchFilter.title}</span>
                                                <img onClick={() => setSearchFilter(prev => ({ ...prev, title: "" }))} className='cursor-pointer h-4 w-4' src={assets.cross_icon} alt="" />
                                            </span>
                                        )}
                                        {searchFilter.location && (
                                            <span className='inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded-lg text-sm'>
                                                <span>Location: {searchFilter.location}</span>
                                                <img onClick={() => setSearchFilter(prev => ({ ...prev, location: "" }))} className='cursor-pointer h-4 w-4' src={assets.cross_icon} alt="" />
                                            </span>
                                        )}
                                        {searchFilter.experience && (
                                            <span className='inline-flex items-center gap-2.5 bg-green-50 border border-green-200 px-4 py-1.5 rounded-lg text-sm'>
                                                <span>Experience: {searchFilter.experience}</span>
                                                <img onClick={() => setSearchFilter(prev => ({ ...prev, experience: "" }))} className='cursor-pointer h-4 w-4' src={assets.cross_icon} alt="" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        }

                        <button 
                            onClick={() => setShowFilter(!showFilter)} 
                            className={`w-full lg:hidden px-6 py-3 rounded-lg border border-gray-300 bg-white font-medium mb-4 ${getActiveFiltersCount() > 0 ? 'border-blue-500 text-blue-600' : 'text-gray-700'}`}
                        >
                            {showFilter ? "Close Filters" : `Filters ${getActiveFiltersCount() > 0 ? `(${getActiveFiltersCount()})` : ''}`}
                        </button>

                        {/* Single Filters Box */}
                        <div className={showFilter ? "block" : "hidden lg:block"}>
                            <AdvancedFilters 
                                onApplyFilters={handleAdvancedFilters}
                                className="shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Job listings */}
                <section className='w-full lg:w-3/4'>
                    <div className='bg-white rounded-lg p-6 mb-6 shadow-sm'>
                        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                            <div>
                                <h3 className='font-semibold text-2xl text-gray-800' id='job-list'>
                                    {filteredJobs.length > 0 ? `${filteredJobs.length} Jobs Found` : 'No Jobs Found'}
                                </h3>
                                <p className='text-gray-600 mt-1'>
                                    {filteredJobs.length > 0 
                                        ? 'Find your perfect job from top companies' 
                                        : 'Try adjusting your filters to see more results'
                                    }
                                </p>
                            </div>
                            
                            {/* Sort Options */}
                            <div className='flex items-center gap-3'>
                                <span className='text-sm text-gray-600'>Sort by:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className='border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                >
                                    <option value="relevant">Most Relevant</option>
                                    <option value="recent">Most Recent</option>
                                    <option value="salary-high">Salary: High to Low</option>
                                    <option value="salary-low">Salary: Low to High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Job Results */}
                    {filteredJobs.length === 0 ? (
                        <div className='bg-white rounded-lg p-12 text-center shadow-sm'>
                            <div className='text-gray-400 text-6xl mb-4'>🔍</div>
                            <h3 className='text-xl font-semibold text-gray-600 mb-2'>No jobs found</h3>
                            <p className='text-gray-500 mb-6'>Try adjusting your search criteria or browse all jobs</p>
                            <button 
                                onClick={() => {
                                    setSelectedCategories([])
                                    setSelectedLocations([])
                                    setAdvancedFilters(null)
                                    setSearchFilter({ title: '', location: '', experience: '' })
                                }}
                                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium'
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {filteredJobs.slice((currentPage - 1) * 10, currentPage * 10).map((job, index) => (
                                <JobCard key={job._id} job={job} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredJobs.length > 0 && filteredJobs.length > 10 && (
                        <div className='flex items-center justify-center space-x-2 mt-10 bg-white p-6 rounded-lg shadow-sm'>
                            <a href="#job-list">
                                <img 
                                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} 
                                    src={assets.left_arrow_icon} 
                                    alt="Previous" 
                                    className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'}`}
                                />
                            </a>
                            
                            {Array.from({ length: Math.min(Math.ceil(filteredJobs.length / 10), 10) }).map((_, index) => (
                                <a key={index} href="#job-list">
                                    <button 
                                        onClick={() => setCurrentPage(index + 1)} 
                                        className={`w-10 h-10 flex items-center justify-center border rounded-lg font-medium transition-colors ${
                                            currentPage === index + 1 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                </a>
                            ))}
                            
                            <a href="#job-list">
                                <img 
                                    onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredJobs.length / 10)))} 
                                    src={assets.right_arrow_icon} 
                                    alt="Next" 
                                    className={`cursor-pointer ${
                                        currentPage === Math.ceil(filteredJobs.length / 10) 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:opacity-75'
                                    }`}
                                />
                            </a>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default JobListing