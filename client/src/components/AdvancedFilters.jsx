import { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import { formatSalaryRange } from '../utils/formatSalary'

const AdvancedFilters = ({ onApplyFilters, className = "" }) => {
    const { jobs } = useContext(AppContext)
    
    const [filters, setFilters] = useState({
        categories: [],
        locations: [],
        experienceLevels: [],
        salaryRange: { min: '', max: '' },
        jobTypes: [],
        workModes: [],
        companyTypes: [],
        skills: [],
        postedWithin: ''
    })
    
    const [showAllCategories, setShowAllCategories] = useState(false)
    const [showAllLocations, setShowAllLocations] = useState(false)
    const [skillInput, setSkillInput] = useState('')

    const experienceLevels = ['Beginner level', 'Intermediate level', 'Senior level']
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
    const workModes = ['Remote', 'On-site', 'Hybrid']
    const companyTypes = ['Startup', 'MNC', 'Government', 'Non-Profit', 'Small Business']
    const postedWithinOptions = [
        { value: '1', label: 'Last 24 hours' },
        { value: '3', label: 'Last 3 days' },
        { value: '7', label: 'Last week' },
        { value: '30', label: 'Last month' }
    ]

    // Get salary range from existing jobs
    const salaries = jobs
        .flatMap(job => [job.salary?.min, job.salary?.max])
        .filter(v => typeof v === 'number' && !Number.isNaN(v))
        .sort((a, b) => a - b)
    const minSalary = salaries[0] || 0
    const maxSalary = salaries[salaries.length - 1] || 2000000

    const handleCheckboxChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType].includes(value)
                ? prev[filterType].filter(item => item !== value)
                : [...prev[filterType], value]
        }))
    }

    const handleSalaryChange = (type, value) => {
        setFilters(prev => ({
            ...prev,
            salaryRange: {
                ...prev.salaryRange,
                [type]: value
            }
        }))
    }

    const addSkill = (skill) => {
        if (skill && !filters.skills.includes(skill)) {
            setFilters(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }))
        }
        setSkillInput('')
    }

    const removeSkill = (skillToRemove) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }))
    }

    const resetFilters = () => {
        setFilters({
            categories: [],
            locations: [],
            experienceLevels: [],
            salaryRange: { min: '', max: '' },
            jobTypes: [],
            workModes: [],
            companyTypes: [],
            skills: [],
            postedWithin: ''
        })
        setSkillInput('')
    }

    const applyFilters = () => {
        onApplyFilters(filters)
    }

    const getActiveFiltersCount = () => {
        return filters.categories.length + 
               filters.locations.length + 
               filters.experienceLevels.length +
               filters.jobTypes.length +
               filters.workModes.length +
               filters.companyTypes.length +
               filters.skills.length +
               (filters.salaryRange.min || filters.salaryRange.max ? 1 : 0) +
               (filters.postedWithin ? 1 : 0)
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
            <div className='flex justify-between items-center mb-6'>
                <h3 className='text-lg font-semibold text-gray-800'>
                    Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                </h3>
                <button 
                    onClick={resetFilters}
                    className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                >
                    Clear All
                </button>
            </div>

            <div className='space-y-6'>
                {/* Job Categories */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Job Categories</h4>
                    <div className='space-y-2 max-h-48 overflow-y-auto'>
                        {JobCategories.slice(0, showAllCategories ? JobCategories.length : 5).map(category => (
                            <label key={category} className='flex items-center space-x-3 cursor-pointer'>
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(category)}
                                    onChange={() => handleCheckboxChange('categories', category)}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                                <span className='text-gray-700'>{category}</span>
                                <span className='text-gray-500 text-sm'>
                                    ({jobs.filter(job => job.category === category).length})
                                </span>
                            </label>
                        ))}
                        {JobCategories.length > 5 && (
                            <button
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                            >
                                {showAllCategories ? 'Show Less' : `Show ${JobCategories.length - 5} More`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Locations */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Locations</h4>
                    <div className='space-y-2 max-h-48 overflow-y-auto'>
                        {JobLocations.slice(0, showAllLocations ? JobLocations.length : 5).map(location => (
                            <label key={location} className='flex items-center space-x-3 cursor-pointer'>
                                <input
                                    type="checkbox"
                                    checked={filters.locations.includes(location)}
                                    onChange={() => handleCheckboxChange('locations', location)}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                                <span className='text-gray-700'>{location}</span>
                                <span className='text-gray-500 text-sm'>
                                    ({jobs.filter(job => job.location === location).length})
                                </span>
                            </label>
                        ))}
                        {JobLocations.length > 5 && (
                            <button
                                onClick={() => setShowAllLocations(!showAllLocations)}
                                className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                            >
                                {showAllLocations ? 'Show Less' : `Show ${JobLocations.length - 5} More`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Experience Level */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Experience Level</h4>
                    <div className='space-y-2'>
                        {experienceLevels.map(level => (
                            <label key={level} className='flex items-center space-x-3 cursor-pointer'>
                                <input
                                    type="checkbox"
                                    checked={filters.experienceLevels.includes(level)}
                                    onChange={() => handleCheckboxChange('experienceLevels', level)}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                                <span className='text-gray-700'>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Salary Range */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Salary Range (₹ per annum)</h4>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.salaryRange.min}
                                onChange={(e) => handleSalaryChange('min', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.salaryRange.max}
                                onChange={(e) => handleSalaryChange('max', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                        </div>
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                        Range: {formatSalaryRange(filters.salaryRange.min, filters.salaryRange.max)}
                    </div>
                </div>

                {/* Job Type */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Job Type</h4>
                    <div className='space-y-2'>
                        {jobTypes.map(type => (
                            <label key={type} className='flex items-center space-x-3 cursor-pointer'>
                                <input
                                    type="checkbox"
                                    checked={filters.jobTypes.includes(type)}
                                    onChange={() => handleCheckboxChange('jobTypes', type)}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                                <span className='text-gray-700'>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Work Mode */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Work Mode</h4>
                    <div className='space-y-2'>
                        {workModes.map(mode => (
                            <label key={mode} className='flex items-center space-x-3 cursor-pointer'>
                                <input
                                    type="checkbox"
                                    checked={filters.workModes.includes(mode)}
                                    onChange={() => handleCheckboxChange('workModes', mode)}
                                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                />
                                <span className='text-gray-700'>{mode}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Posted Within */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Posted Within</h4>
                    <select
                        value={filters.postedWithin}
                        onChange={(e) => setFilters(prev => ({ ...prev, postedWithin: e.target.value }))}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                        <option value="">Any time</option>
                        {postedWithinOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Skills */}
                <div>
                    <h4 className='font-medium text-gray-800 mb-3'>Skills</h4>
                    <div className='flex gap-2 mb-3'>
                        <input
                            type="text"
                            placeholder="Add skill (e.g. React, Python)"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addSkill(skillInput.trim())
                                }
                            }}
                            className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <button
                            onClick={() => addSkill(skillInput.trim())}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                        >
                            Add
                        </button>
                    </div>
                    {filters.skills.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                            {filters.skills.map(skill => (
                                <span
                                    key={skill}
                                    className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        className='hover:text-blue-600'
                                    >
                                        <img src={assets.cross_icon} alt="Remove" className='h-3 w-3' />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Apply Filters Button */}
            <div className='mt-6 pt-6 border-t'>
                <button
                    onClick={applyFilters}
                    className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors'
                >
                    Apply Filters
                </button>
            </div>
        </div>
    )
}

export default AdvancedFilters