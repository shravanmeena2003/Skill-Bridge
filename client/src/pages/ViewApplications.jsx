import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { useParams, useNavigate } from 'react-router-dom'
import DetailedApplicationView from '../components/DetailedApplicationView'

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext)
  const [applicants, setApplicants] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [resumeLoading, setResumeLoading] = useState({})
  const { id } = useParams()
  const navigate = useNavigate()
  const [singleApplication, setSingleApplication] = useState(null)

  // Function to fetch single application
  const fetchSingleApplication = async (applicationId) => {
    try {
      if (!companyToken) {
        toast.error('Authentication required');
        navigate('/dashboard/view-applications');
        return;
      }

      if (!applicationId) {
        console.error('No application ID provided');
        toast.error('Invalid application ID');
        navigate('/dashboard/view-applications');
        return;
      }

      // Log the full application ID
      console.log('Fetching application - Full ID:', applicationId);
      // Log the trimmed version to check for any whitespace issues
      console.log('Trimmed ID:', applicationId.trim());
      setLoading(true);
      
      const { data } = await axios.get(
        `${backendUrl}/api/applications/${applicationId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${companyToken}`,
            'token': companyToken 
          }
        }
      );

      if (data.success) {
        console.log('Application data received:', data.application);
        setSingleApplication(data.application);
      } else {
        console.error('API error:', data.message);
        toast.error(data.message || 'Failed to load application');
        navigate('/dashboard/view-applications');
      }
    } catch (error) {
      console.error('Fetch application error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data?.message || 'Failed to load application details');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An error occurred while loading the application');
      }
      navigate('/dashboard/view-applications');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch company Job Applications data 
  const fetchCompanyJobApplications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/applications/company`,
        { 
          headers: { 
            'Authorization': `Bearer ${companyToken}`,
            'token': companyToken 
          }
        }
      );

      if (data.success) {
        setApplicants(data.applications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  // Function to Update Job Applications Status 
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setActionLoading(prev => ({ ...prev, [applicationId]: true }));

      const { data } = await axios.put(
        `${backendUrl}/api/applications/${applicationId}`,
        { status },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        // Update the applicant status in the local state
        setApplicants(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { ...app, status: status }
              : app
          )
        );
        toast.success(`Application ${status.toLowerCase()} successfully`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update application status');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Handle resume view/download
  const handleResumeClick = async (resume, applicantName, applicationId) => {
    if (!resume || resume === 'undefined' || resume === 'null') {
      toast.error(`Resume not available for ${applicantName}`);
      return;
    }

    try {
      setResumeLoading(prev => ({ ...prev, [applicationId]: true }));
      
      // Validate Cloudinary URL format
      const resumeUrl = resume.trim();
      if (!resumeUrl.includes('cloudinary.com') || !resumeUrl.startsWith('http')) {
        throw new Error('Invalid resume URL format');
      }

      // Try to validate the URL is accessible
      try {
        const response = await fetch(resumeUrl, { 
          method: 'HEAD',
          headers: {
            'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        });
        
        if (!response.ok) {
          throw new Error('Resume file not accessible');
        }
      } catch (fetchError) {
        console.warn('Resume URL validation failed:', fetchError);
        // Continue anyway as some Cloudinary URLs might not support HEAD requests
      }

      // Open resume in new tab
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Resume access error:', error);
      toast.error(`Unable to access resume for ${applicantName}. The resume link may be invalid.`);
    } finally {
      setResumeLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      interviewed: 'bg-purple-100 text-purple-800',
      offered: 'bg-indigo-100 text-indigo-800',
      hired: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    console.log('ViewApplications effect running with:', { id, companyToken });
    if (id) {
      console.log('About to fetch single application with ID:', id);
      // Log the URL we're going to call
      console.log('Will fetch from:', `${backendUrl}/api/applications/${id}`);
      fetchSingleApplication(id);
    } else if (companyToken) {
      fetchCompanyJobApplications();
    }
  }, [id, companyToken]);

  if (loading) {
    return <Loading />;
  }

  if (id) {
    return (
      <div className='bg-gray-100 p-10 min-h-screen'>
        <DetailedApplicationView
          application={singleApplication}
          loading={loading}
          updateApplicationStatus={updateApplicationStatus}
          actionLoading={actionLoading}
          onBack={() => navigate('/dashboard/view-applications')}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">View Applications</h2>
      
      {applicants && applicants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicants.filter(item => item.jobId && item.userId).map((application) => (
                <tr 
                  key={application._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={application.userId.image || assets.person_icon}
                          alt={application.userId.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.userId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.userId.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.jobId.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleResumeClick(
                        application.userId.resume,
                        application.userId.name,
                        application._id
                      )}
                      className={`group flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                        application.userId.resume && application.userId.resume !== 'undefined'
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!application.userId.resume || application.userId.resume === 'undefined' || resumeLoading[application._id]}
                      title={application.userId.resume ? "Click to view resume" : "No resume available"}
                    >
                      {resumeLoading[application._id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Opening Resume...</span>
                        </>
                      ) : (
                        <>
                          <img 
                            src={application.userId.resume && application.userId.resume !== 'undefined' 
                              ? assets.resume_selected 
                              : assets.resume_not_selected}
                            alt="Resume"
                            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                              application.userId.resume && application.userId.resume !== 'undefined'
                                ? 'group-hover:rotate-6'
                                : ''
                            }`}
                          />
                          <span className="font-medium">
                            {application.userId.resume && application.userId.resume !== 'undefined' 
                              ? 'View Resume' 
                              : 'No Resume Available'}
                          </span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/dashboard/view-applications/${application._id}`)}
                        className="inline-flex items-center px-3 py-1 border border-blue-600 text-sm leading-4 font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                      >
                        View Details
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'hired')}
                            disabled={actionLoading[application._id]}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150 ${
                              actionLoading[application._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {actionLoading[application._id] ? (
                              <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <img src={assets.person_tick_icon} alt="Accept" className="w-4 h-4 mr-1" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            disabled={actionLoading[application._id]}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 ${
                              actionLoading[application._id] ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {actionLoading[application._id] ? (
                              <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <img src={assets.cross_icon} alt="Reject" className="w-4 h-4 mr-1" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <img src={assets.users_icon} alt="No Applications" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Applications</h3>
          <p className="mt-1 text-sm text-gray-500">No one has applied to your jobs yet.</p>
        </div>
      )}
    </div>
  );
}

export default ViewApplications