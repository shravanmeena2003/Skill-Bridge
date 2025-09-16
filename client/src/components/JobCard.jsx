import { useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import useSavedJobs from '../hooks/useSavedJobs'
import kconvert from 'k-convert'
import moment from 'moment'
import { useUser } from '@clerk/clerk-react'
import { formatSalaryRange } from '../utils/formatSalary'

const JobCard = ({ job }) => {

  const navigate = useNavigate()
  const { user } = useUser()
  const { userApplications } = useContext(AppContext)
  const { toggleSaveJob, isJobSaved } = useSavedJobs()
  
  const isAlreadyApplied = userApplications.some(app => app.jobId && app.jobId._id === job._id)
  const isSaved = isJobSaved(job._id)

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (!user) {
      // Handle case when user is not logged in
      return
    }
    await toggleSaveJob(job._id)
  }

  const handleQuickApply = (e) => {
    e.stopPropagation()
    navigate(`/apply-job/${job._id}`)
    scrollTo(0, 0)
  }

  const handleViewDetails = () => {
    navigate(`/apply-job/${job._id}`)
    scrollTo(0, 0)
  }

  const getTimePosted = () => {
    const now = moment()
    const posted = moment(job.date)
    const diffHours = now.diff(posted, 'hours')
    const diffDays = now.diff(posted, 'days')
    
    if (diffHours < 24) {
      return `Posted ${diffHours}h ago`
    } else if (diffDays < 7) {
      return `Posted ${diffDays}d ago`
    } else {
      return `Posted ${posted.format('MMM DD')}`
    }
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative'>
      {/* Featured Badge */}
      {job.featured && (
        <div className='absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold'>
          ⭐ Featured
        </div>
      )}

      <div onClick={handleViewDetails}>
        {/* Header */}
        <div className='flex justify-between items-start mb-4'>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <img 
                className='h-14 w-14 rounded-xl object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors' 
                src={job.companyId.image} 
                alt={job.companyId.name} 
              />
              {/* Company verification badge */}
              <div className='absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1'>
                <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'></path>
                </svg>
              </div>
            </div>
            
            <div className='flex-1'>
              <h3 className='font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1'>
                {job.title}
              </h3>
              <p className='text-gray-600 text-sm font-medium mb-1'>{job.companyId.name}</p>
              <div className='flex items-center space-x-2 text-xs text-gray-500'>
                <span>{job.companyId.reviewCount || 0} reviews</span>
                {job.companyId.rating && (
                  <>
                    <span>•</span>
                    <div className='flex items-center gap-1'>
                      <img src={assets.star_filled_icon} alt="" className='h-3 w-3 text-yellow-500' />
                      <span>{job.companyId.rating}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleBookmark}
            className='p-2 rounded-full hover:bg-gray-100 transition-colors group'
          >
            <img 
              className={`h-5 w-5 transition-colors ${
                isSaved ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
              }`}
              src={isSaved ? assets.bookmark_filled_icon : assets.bookmark_icon} 
              alt="Bookmark" 
            />
          </button>
        </div>

        {/* Job Details */}
        <div className='space-y-4 mb-4'>
          {/* Location, Experience and Salary */}
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <img src={assets.location_icon} alt="" className='h-4 w-4' />
              <span>{job.location}</span>
            </div>
            <div className='flex items-center gap-1.5 text-gray-600'>
              <img src={assets.person_icon} alt="" className='h-4 w-4' />
              <span>{job.level}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <img src={assets.money_icon} alt="" className='h-4 w-4 text-green-600' />
              <span className='font-semibold text-green-700'>
                {formatSalaryRange(job.salary?.min, job.salary?.max)}
              </span>
            </div>
          </div>

          {/* Job Tags */}
          <div className='flex flex-wrap gap-2'>
            <span className='px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200'>
              {job.category}
            </span>
            <span className='px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200'>
              {job.level.split(' ')[0]}
            </span>
            {job.jobType && (
              <span className='px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200'>
                {job.jobType}
              </span>
            )}
            {job.workMode && (
              <span className='px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200'>
                {job.workMode}
              </span>
            )}
          </div>

          {/* Job Description Preview */}
          <div 
            className='text-gray-600 text-sm line-clamp-2 leading-relaxed'
            dangerouslySetInnerHTML={{ __html: job.description.slice(0, 150) + '...' }}
          />

          {/* Skills (if available) */}
          {job.skills && job.skills.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {job.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className='px-2 py-1 text-gray-500 text-xs'>
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Posted Time and Applicants */}
          <div className='flex justify-between items-center text-xs text-gray-500'>
            <span className='flex items-center gap-1'>
              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd'></path>
              </svg>
              {getTimePosted()}
            </span>
            <div className='flex items-center gap-1'>
              <img src={assets.users_icon} alt="" className='h-3 w-3' />
              <span>Be among the first 25 applicants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4 border-t border-gray-100'>
        <button 
          onClick={handleQuickApply}
          disabled={isAlreadyApplied}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            isAlreadyApplied 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-95'
          }`}
        >
          {isAlreadyApplied ? (
            <div className='flex items-center justify-center gap-2'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd'></path>
              </svg>
              Applied
            </div>
          ) : (
            'Quick Apply'
          )}
        </button>
        
        <button 
          onClick={handleViewDetails}
          className='flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors active:scale-95'
        >
          View Details
        </button>
      </div>

      {/* Match Score (if available) */}
      {job.matchScore && (
        <div className='mt-3 pt-3 border-t border-gray-100'>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-600'>Profile Match</span>
            <div className='flex items-center gap-2'>
              <div className='bg-green-100 rounded-full px-2 py-1'>
                <span className='text-xs font-semibold text-green-700'>{job.matchScore}% match</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Urgency Indicator */}
      {job.urgent && (
        <div className='absolute top-0 left-0 bg-red-500 text-white px-3 py-1 rounded-br-lg rounded-tl-xl text-xs font-semibold'>
          🔥 Urgent Hiring
        </div>
      )}
    </div>
  )
}

export default JobCard