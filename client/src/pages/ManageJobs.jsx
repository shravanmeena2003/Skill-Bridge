import { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

const ManageJobs = () => {

  const navigate = useNavigate()

  const [jobs, setJobs] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const { backendUrl, companyToken } = useContext(AppContext)

  // Function to fetch recruiter's jobs
  const fetchRecruiterJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/jobs/recruiter/jobs',
        { headers: { Authorization: `Bearer ${companyToken}` } }
      );

      if (data.success) {
        setJobs(data.jobs)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Function to change Job Status
  const changeJobStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      
      const { data } = await axios.put(backendUrl + `/api/jobs/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${companyToken}` } }
      );

      if (data.success) {
        toast.success('Job status updated successfully');
        fetchRecruiterJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  // Function to delete a job
  const deleteJob = async (id) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this job? This action cannot be undone.')
      if (!confirmed) return

      setDeletingId(id)

      const { data } = await axios.delete(backendUrl + `/api/jobs/${id}`,
        { headers: { Authorization: `Bearer ${companyToken}` } }
      )

      if (data.success) {
        toast.success('Job deleted successfully')
        setJobs(prev => prev.filter(j => j._id !== id))
      } else {
        toast.error(data.message || 'Failed to delete job')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchRecruiterJobs()
    }
  }, [companyToken])

  return jobs ? jobs.length === 0 ? (
    <div className='flex items-center justify-center h-[70vh]'>
      <p className='text-xl sm:text-2xl'>No Jobs Available or posted</p>
    </div>
  ) : (
    <div className='container p-4 max-w-5xl'>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>#</th>
              <th className='py-2 px-4 border-b text-left'>Job Title</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-2 px-4 border-b text-center'>Applicants</th>
              <th className='py-2 px-4 border-b text-left'>Status</th>
              <th className='py-2 px-4 border-b text-left'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={index} className='text-gray-700'>
                <td className='py-2 px-4 border-b max-sm:hidden'>{index + 1}</td>
                <td className='py-2 px-4 border-b' >{job.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden' >{moment(job.createdAt).format('ll')}</td>
                <td className='py-2 px-4 border-b max-sm:hidden' >{job.location}</td>
                <td className='py-2 px-4 border-b text-center' >{job.applications?.length || 0}</td>
                <td className='py-2 px-4 border-b' >
                  <button 
                    onClick={() => changeJobStatus(job._id, job.status)}
                    className={`px-3 py-1 rounded text-sm ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </button>
                </td>
                <td className='py-2 px-4 border-b'>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/dashboard/add-job/${job._id}`)}
                      className='text-blue-500 hover:text-blue-700 transition-colors'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/view-applications/${job._id}`)}
                      className='text-purple-500 hover:text-purple-700 transition-colors'
                    >
                      Applications
                    </button>
                    <button
                      onClick={() => deleteJob(job._id)}
                      disabled={deletingId === job._id}
                      className={`transition-colors ${deletingId === job._id ? 'text-red-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                    >
                      {deletingId === job._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex justify-end'>
        <button onClick={() => navigate('/dashboard/add-job')} className='bg-black text-white py-2 px-4 rounded'>Add new job</button>
      </div>
    </div>
  ) : <Loading />
}

export default ManageJobs