import { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import Loading from '../components/Loading'
import { AppContext } from '../context/AppContext'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const SavedJobs = () => {
    const { backendUrl } = useContext(AppContext)
    const { getToken } = useAuth()
    const [savedJobs, setSavedJobs] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchSavedJobs = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(`${backendUrl}/api/users/saved-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setSavedJobs(data.savedJobs)
            }
        } catch (error) {
            toast.error('Failed to fetch saved jobs')
            console.error('Error fetching saved jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSavedJobs()
    }, [])

    if (loading) {
        return <Loading />
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-gray-50 py-8'>
                <div className='container 2xl:px-20 mx-auto px-4'>
                    <div className='mb-8'>
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Saved Jobs</h1>
                        <p className='text-gray-600'>
                            {savedJobs.length > 0 
                                ? `You have ${savedJobs.length} saved ${savedJobs.length === 1 ? 'job' : 'jobs'}` 
                                : 'No saved jobs yet'
                            }
                        </p>
                    </div>

                    {savedJobs.length === 0 ? (
                        <div className='bg-white rounded-lg p-12 text-center shadow-sm'>
                            <div className='text-gray-400 text-6xl mb-4'>💾</div>
                            <h3 className='text-xl font-semibold text-gray-600 mb-2'>No saved jobs yet</h3>
                            <p className='text-gray-500 mb-6'>Start saving jobs you're interested in to view them here</p>
                            <button 
                                onClick={() => window.location.href = '/jobs'}
                                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium'
                            >
                                Browse Jobs
                            </button>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-4'>
                            {savedJobs.map((savedJob, index) => (
                                <JobCard key={savedJob._id || index} job={savedJob.jobId} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default SavedJobs