import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth, useUser } from '@clerk/clerk-react'

const ApplyJob = () => {

  const { id } = useParams()

  const { getToken } = useAuth()
  const { isSignedIn, user } = useUser()

  const navigate = useNavigate()

  const [JobData, setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)

  const { jobs, backendUrl, userData, userApplications, fetchUserApplications } = useContext(AppContext)

  const fetchJob = async () => {

    try {

      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`)

      if (data.success) {
        setJobData(data.job)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  const applyHandler = async () => {
    try {
      // Check if user is signed in with Clerk
      if (!isSignedIn || !user) {
        return toast.error('Please Sign In to Apply');
      }
      
      // Get token first
      const token = await getToken();
      
      if (!token) {
        return toast.error('Authentication failed. Please sign in again.');
      }
      
      // Fetch user data directly to ensure we have the latest data
      const userResponse = await axios.get(`${backendUrl}/api/users/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!userResponse.data.success) {
        return toast.error(userResponse.data.message || 'Unable to fetch user data');
      }
      
      const currentUserData = userResponse.data.user;
      
      // Check if user has uploaded a resume
      if (!currentUserData.resume) {
        navigate('/applications');
        return toast.error('Please upload your resume in profile section');
      }
      
      const response = await axios.post(`${backendUrl}/api/users/apply`, {
        jobId: JobData._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUserApplications();
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred while applying');
    }
  }

  const checkAlreadyApplied = () => {

    const hasApplied = userApplications.some(item => item.jobId._id === JobData._id)
    setIsAlreadyApplied(hasApplied)

  }

  useEffect(() => {
    fetchJob()
  }, [id])

  useEffect(() => {
    if (userApplications.length > 0 && JobData) {
      checkAlreadyApplied()
    }
  }, [JobData, userApplications, id])

  return JobData ? (
    <>
      <Navbar />

      <div className='min-h-screen flex flex-col py-6 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-full shadow-sm'>
          {/* Header Section */}
          <div className='flex justify-between items-start p-6 border-b'>
            <div className='flex gap-6'>
              <img className='h-16 w-16 object-contain bg-white rounded-lg p-2 border' src={JobData.companyId.image} alt={JobData.companyId.name} />
              <div>
                <h1 className='text-2xl font-medium text-gray-900'>{JobData.title}</h1>
                <div className='flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600'>
                  <span className='flex items-center gap-1'>
                    <img src={assets.suitcase_icon} alt="" className='w-4 h-4' />
                    {JobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.location_icon} alt="" className='w-4 h-4' />
                    {JobData.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.person_icon} alt="" className='w-4 h-4' />
                    Experience: {JobData.experience?.min || '0'}-{JobData.experience?.max || '3'} years
                  </span>
                </div>
                <div className='flex gap-4 mt-3'>
                  <div className='text-sm text-gray-600 flex items-center gap-1'>
                    <span>Posted {moment(JobData.createdAt).fromNow()}</span>
                    {JobData.type && (
                      <>
                        <span>•</span>
                        <span>{JobData.type}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <div className='flex gap-2'>
                <button onClick={applyHandler} 
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    isAlreadyApplied ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
                </button>
                {!isAlreadyApplied && (
                  <button className='px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'>
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row justify-between items-start gap-8 p-6'>
            <div className='w-full lg:w-2/3'>
              {/* Job Match Score */}
              {(JobData.skills?.length > 0 || JobData.location || JobData.experience) && (
                <div className='mb-8'>
                  <h2 className='text-lg font-medium mb-3'>Job match score</h2>
                  <div className='flex gap-3'>
                    {JobData.skills?.length > 0 && (
                      <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1'>
                        <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                        Key Skills
                      </span>
                    )}
                    {JobData.location && (
                      <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1'>
                        <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                        Location
                      </span>
                    )}
                    {JobData.experience && (
                      <span className='px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1'>
                        <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
                        Work Experience
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Job Highlights */}
              {(JobData.highlights?.length > 0 || JobData.level || JobData.type || JobData.workMode) && (
                <div className='mb-8'>
                  <h2 className='text-lg font-medium mb-3'>Job highlights</h2>
                  <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                    {JobData.highlights?.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                    {JobData.level && <li>Role level: {JobData.level}</li>}
                    {JobData.type && <li>Employment Type: {JobData.type}</li>}
                    {JobData.workMode && <li>Work Mode: {JobData.workMode}</li>}
                  </ul>
                </div>
              )}
              
              {/* Job Description */}
              <div className='mb-8'>
                <h2 className='text-lg font-medium mb-3'>Job description</h2>
                <div className='prose max-w-none text-gray-600' dangerouslySetInnerHTML={{ __html: JobData.description }}></div>
              </div>

              {/* Key Skills */}
              <div className='mb-8'>
                <h2 className='text-lg font-medium mb-3'>Key Skills</h2>
                <div className='text-sm text-gray-600 mb-2'>Skills highlighted with "★" are preferred keyskills</div>
                <div className='flex flex-wrap gap-2'>
                  {JobData.skills?.map((skill, index) => (
                    <span key={index} className='px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium flex items-center gap-1'>
                      {JobData.preferredSkills?.includes(skill) && <span className='text-yellow-500'>★</span>}
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Role Details */}
              <div className='mb-8'>
                <h2 className='text-lg font-medium mb-3'>Role</h2>
                <p className='text-gray-600 mb-2'>Role - {JobData.title}</p>
                <p className='text-gray-600 mb-2'>Location - {JobData.location}</p>
                {JobData.department && <p className='text-gray-600 mb-2'>Department - {JobData.department}</p>}
                <p className='text-gray-600'>Experience - {JobData.experience?.min || '0'}-{JobData.experience?.max || '3'} Years</p>
              </div>

              {/* Qualifications */}
              <div className='mb-8'>
                <h2 className='text-lg font-medium mb-3'>Qualification</h2>
                <p className='text-gray-600'>{JobData.qualification || "Bachelor's degree in relevant field"}</p>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className='w-full lg:w-1/3'>
              {/* Jobs you might be interested in */}
              <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <h2 className='text-lg font-medium mb-4'>Jobs you might be interested in</h2>
                <div className='space-y-4'>
                  {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id)
                    .filter(job => {
                      const appliedJobsIds = new Set(userApplications.map(app => app.jobId && app.jobId._id))
                      return !appliedJobsIds.has(job._id)
                    }).slice(0, 3)
                    .map((job, index) => (
                      <div key={index} className='p-4 border rounded-lg hover:border-blue-300 transition-colors'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h3 className='font-medium text-gray-900'>{job.title}</h3>
                            <p className='text-sm text-gray-600'>{job.companyId.name}</p>
                          </div>
                          <img src={job.companyId.image} alt={job.companyId.name} className='w-10 h-10 rounded object-contain' />
                        </div>
                        <div className='text-sm text-gray-500 space-y-1'>
                          <p>Experience: {job.experience?.min || '0'}-{job.experience?.max || '3'} Yrs</p>
                          <p>Location: {job.location}</p>
                          <p className='text-xs text-gray-400'>Posted {moment(job.createdAt).fromNow()}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Company Info */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-lg font-medium mb-4'>About the Company</h2>
                <div className='flex items-center gap-3 mb-4'>
                  <img src={JobData.companyId.image} alt={JobData.companyId.name} 
                    className='w-12 h-12 rounded-lg object-contain border p-2' />
                  <div>
                    <h3 className='font-medium'>{JobData.companyId.name}</h3>
                    <div className='text-sm text-gray-600 flex items-center gap-2'>
                      <span>{JobData.companyId.industry || 'Technology'}</span>
                      <span>•</span>
                      <span>{JobData.companyId.size || '10k+ employees'}</span>
                    </div>
                  </div>
                </div>
                <div className='text-sm text-gray-600'>
                  {JobData.companyId.description || 
                    'A leading global professional services organization, helping customers transform their business through technology and innovation.'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default ApplyJob