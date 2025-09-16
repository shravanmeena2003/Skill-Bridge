import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import InterviewCalendar from './InterviewCalendar';
import InterviewScheduleModal from './InterviewScheduleModal';
import axiosInstance from '../utils/axiosConfig';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { formatSalaryRange, formatSalaryToLPA } from '../utils/formatSalary';

const DetailedApplicationView = ({ 
  application, 
  loading, 
  updateApplicationStatus,
  actionLoading
}) => {
  const [interviews, setInterviews] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const navigate = useNavigate();

  if (loading) return <Loading />;
  if (!application) return <p>Application not found</p>;

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      interviewed: 'bg-purple-100 text-purple-800',
      offered: 'bg-indigo-100 text-indigo-800',
      hired: 'bg-emerald-100 text-emerald-800',
      accepted: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (application?._id) {
      fetchInterviews();
    }
  }, [application]);

  const fetchInterviews = async () => {
    try {
      setInterviewLoading(true);
      const { data } = await axiosInstance.get(
        `/api/interviews/company/list?applicationId=${application._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('companyToken')}`,
            'token': localStorage.getItem('companyToken')
          }
        }
      );

      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedSlot(start);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleInterview = async (formData) => {
    try {
      setInterviewLoading(true);
      const { data } = await axiosInstance.post(
        `/api/interviews/company/schedule`,
        {
          ...formData,
          applicationId: application._id
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('companyToken')}`,
            'token': localStorage.getItem('companyToken')
          }
        }
      );

      if (data.success) {
        toast.success('Interview scheduled successfully');
        setIsScheduleModalOpen(false);
        fetchInterviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    // Show interview details or allow editing
    toast.info(`${event.title}\nStatus: ${event.interview.status}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/view-applications')}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <img src={assets.back_arrow_icon} alt="back" className="w-4 h-4" />
          Back to Applications
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full overflow-hidden">
                <img 
                  src={application.userId?.image || assets.person_icon}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{application.userId?.name}</h1>
                <p className="text-gray-600">{application.userId?.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Applied {formatDate(application.createdAt || application.applicationDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Position Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="font-medium text-gray-900">{application.jobId?.title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="font-medium text-gray-900">{application.jobId?.location}</p>
                </div>
                {application.jobId?.salary && (
                  <div>
                    <label className="text-sm text-gray-500">Salary Range</label>
                    <p className="font-medium text-gray-900">
                      {formatSalaryRange(application.jobId.salary.min, application.jobId.salary.max)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <a
                  href={application.userId?.resume || application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 transition duration-150"
                >
                  <img src={assets.resume_selected} alt="Resume" className="w-5 h-5 mr-2" />
                  View Full Resume
                </a>
              </div>
            </div>
          </div>

          {/* Application Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Application Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {application.coverLetter && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">Cover Letter</label>
                    <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                )}
                {application.expectedSalary && (
                  <div>
                    <label className="text-sm text-gray-500 block">Expected Salary</label>
                    <p className="font-medium text-gray-900">{formatSalaryToLPA(application.expectedSalary)} (Expected)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update Section */}
            {application.status === 'pending' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Update Status</h2>
                <div className="bg-gray-50 rounded-lg p-4 flex gap-4">
                  <button
                    onClick={() => updateApplicationStatus(application._id, 'hired')}
                    disabled={actionLoading[application._id]}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 transition duration-150"
                  >
                    Accept Application
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application._id, 'rejected')}
                    disabled={actionLoading[application._id]}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 transition duration-150"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview Calendar Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Interviews</h3>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Schedule Interview
          </button>
        </div>
        {interviewLoading ? (
          <Loading />
        ) : (
          <InterviewCalendar
            interviews={interviews}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </div>

      {/* Interview Schedule Modal */}
      <InterviewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleInterview}
        applicationData={application}
      />
    </div>
  );
};

export default DetailedApplicationView;