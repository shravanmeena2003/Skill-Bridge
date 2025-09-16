import { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '@clerk/clerk-react'

// Custom hook for managing saved jobs
const useSavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([])
    const [savedJobIds, setSavedJobIds] = useState(new Set())
    const [loading, setLoading] = useState(false)
    const { backendUrl } = useContext(AppContext)
    const { getToken, isSignedIn } = useAuth()

    const fetchSavedJobs = async () => {
        if (!isSignedIn) return
        
        setLoading(true)
        try {
            const token = await getToken()
            const { data } = await axios.get(`${backendUrl}/api/users/saved-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setSavedJobs(data.savedJobs)
                setSavedJobIds(new Set(data.savedJobs.map(job => job._id)))
            }
        } catch (error) {
            console.error('Error fetching saved jobs:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSaveJob = async (jobId) => {
        if (!isSignedIn) {
            toast.error('Please sign in to save jobs')
            return false
        }

        try {
            const token = await getToken()
            const { data } = await axios.post(`${backendUrl}/api/users/save-job`, 
                { jobId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                if (data.saved) {
                    setSavedJobIds(prev => new Set([...prev, jobId]))
                    toast.success('Job saved successfully')
                } else {
                    setSavedJobIds(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(jobId)
                        return newSet
                    })
                    // Update saved jobs list by removing the unsaved job
                    setSavedJobs(prev => prev.filter(job => job._id !== jobId))
                    toast.success('Job removed from saved jobs')
                }
                return data.saved
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error('Failed to update saved jobs')
            return false
        }
    }

    const isJobSaved = (jobId) => savedJobIds.has(jobId)

    useEffect(() => {
        if (isSignedIn) {
            fetchSavedJobs()
        }
    }, [isSignedIn])

    return {
        savedJobs,
        savedJobIds,
        loading,
        toggleSaveJob,
        isJobSaved,
        fetchSavedJobs
    }
}

export default useSavedJobs