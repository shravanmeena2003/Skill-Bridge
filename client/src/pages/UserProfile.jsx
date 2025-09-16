import { useContext, useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const UserProfile = () => {
    const { user } = useUser()
    const { getToken } = useAuth()
    const { backendUrl, userData, fetchUserData } = useContext(AppContext)
    
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [isEditing, setIsEditing] = useState(false)
    const [resume, setResume] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(false)
    
    const [profile, setProfile] = useState({
        personalInfo: {
            headline: '',
            phone: '',
            location: '',
            website: '',
            about: ''
        },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        preferences: {
            jobTypes: [],
            locations: [],
            salaryRange: { min: '', max: '' },
            workMode: []
        }
    })

    const [newExperience, setNewExperience] = useState({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
    })

    const handleResumeUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a PDF or Word document');
                return;
            }

            // Validate file size (5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('File size should be less than 5MB');
                return;
            }

            setUploadProgress(true);
            const token = await getToken();

            const formData = new FormData();
            formData.append('resume', file);

            const response = await axios.post(
                `${backendUrl}/api/users/update-resume`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Resume uploaded successfully');
                setResume(response.data.resume);
                // Refresh user data to get updated resume URL
                await fetchUserData();
            } else {
                toast.error(response.data.message || 'Failed to upload resume');
            }
        } catch (error) {
            console.error('Resume upload error:', error);
            toast.error('Failed to upload resume. Please try again.');
        } finally {
            setUploadProgress(false);
        }
    }

    const [newEducation, setNewEducation] = useState({
        degree: '',
        institution: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        grade: ''
    })

    const [newSkill, setNewSkill] = useState('')
    const [newCertification, setNewCertification] = useState({
        name: '',
        issuer: '',
        issueDate: '',
        credentialId: '',
        credentialUrl: ''
    })

    useEffect(() => {
        if (userData) {
            // Populate profile with existing user data
            setProfile(prev => ({
                ...prev,
                personalInfo: {
                    headline: userData.headline || '',
                    phone: userData.phone || '',
                    location: userData.location || '',
                    website: userData.website || '',
                    about: userData.about || ''
                },
                experience: userData.experience || [],
                education: userData.education || [],
                skills: userData.skills || [],
                certifications: userData.certifications || [],
                projects: userData.projects || [],
                preferences: userData.preferences || prev.preferences
            }))
        }
    }, [userData])

    const calculateProfileCompletion = () => {
        let completed = 0
        let total = 8

        if (profile.personalInfo.headline) completed++
        if (profile.personalInfo.about) completed++
        if (profile.personalInfo.phone) completed++
        if (profile.experience.length > 0) completed++
        if (profile.education.length > 0) completed++
        if (profile.skills.length > 0) completed++
        if (userData?.resume) completed++
        if (profile.preferences.jobTypes.length > 0) completed++

        return Math.round((completed / total) * 100)
    }

    // Validate resume file type and size
    const validateResume = (file) => {
        // Check file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a PDF or Word document.')
            return false
        }
        
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
            toast.error('File size exceeds 5MB. Please upload a smaller file.')
            return false
        }
        
        return true
    }
    
    const handleSaveProfile = async () => {
        setLoading(true)
        try {
            const token = await getToken()
            
            // First update the profile information
            const { data } = await axios.put(`${backendUrl}/api/users/profile`, 
                { profile }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            // If resume file is selected, validate and upload it to Cloudinary
            if (resume) {
                // Validate resume file
                if (!validateResume(resume)) {
                    setLoading(false)
                    setResume(null)
                    return
                }
                
                const formData = new FormData()
                formData.append('resume', resume)
                
                try {
                    console.log('Uploading resume with token:', token ? 'Token exists' : 'No token')
                    
                    if (!token) {
                        toast.error('Authentication token is missing. Please log in again.')
                        setLoading(false)
                        return
                    }
                    
                    const resumeResponse = await axios.post(
                        `${backendUrl}/api/users/update-resume`,
                        formData,
                        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                    )
                    
                    if (!resumeResponse.data.success) {
                        toast.error('Failed to upload resume: ' + resumeResponse.data.message)
                        
                        // If user not found, try to create profile
                        if (resumeResponse.data.message === 'User not found') {
                            toast.info('Refreshing user profile...')
                            await fetchUserData()
                        }
                    } else {
                        toast.success('Resume uploaded successfully')
                    }
                } catch (resumeError) {
                    console.error('Resume upload error:', resumeError)
                    
                    if (resumeError.response && resumeError.response.status === 401) {
                        toast.error('Authentication failed. Please log in again.')
                    } else {
                        toast.error('Failed to upload resume. Please try again.')
                    }
                }
            }
            
            if (data.success) {
                toast.success('Profile updated successfully')
                await fetchUserData()
                setIsEditing(false)
                setResume(null)
            }
        } catch (error) {
            console.error('Profile update error:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const addExperience = () => {
        if (newExperience.title && newExperience.company) {
            setProfile(prev => ({
                ...prev,
                experience: [...prev.experience, { ...newExperience, id: Date.now() }]
            }))
            setNewExperience({
                title: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            })
        }
    }

    const addEducation = () => {
        if (newEducation.degree && newEducation.institution) {
            setProfile(prev => ({
                ...prev,
                education: [...prev.education, { ...newEducation, id: Date.now() }]
            }))
            setNewEducation({
                degree: '',
                institution: '',
                fieldOfStudy: '',
                startYear: '',
                endYear: '',
                grade: ''
            })
        }
    }

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }))
            setNewSkill('')
        }
    }

    const removeSkill = (skillToRemove) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }))
    }

    const completionPercentage = calculateProfileCompletion()

    if (!user) {
        return <Loading />
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-gray-50 py-8'>
                <div className='container 2xl:px-20 mx-auto px-4'>
                    {/* Profile Header */}
                    <div className='bg-white rounded-xl shadow-sm p-8 mb-8'>
                        <div className='flex flex-col md:flex-row items-start gap-6'>
                            <img 
                                src={user.imageUrl} 
                                alt={user.fullName}
                                className='w-32 h-32 rounded-full object-cover border-4 border-gray-100'
                            />
                            
                            <div className='flex-1'>
                                <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
                                    <div>
                                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                                            {user.fullName}
                                        </h1>
                                        <p className='text-lg text-gray-600 mb-2'>
                                            {profile.personalInfo.headline || 'Add a professional headline'}
                                        </p>
                                        <p className='text-gray-500 flex items-center gap-1'>
                                            <img src={assets.location_icon} alt="" className='h-4 w-4' />
                                            {profile.personalInfo.location || 'Add location'}
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                    >
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>

                                {/* Profile Completion */}
                                <div className='mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg'>
                                    <div className='flex justify-between items-center mb-2'>
                                        <span className='text-sm font-medium text-gray-700'>Profile Completion</span>
                                        <span className='text-sm font-semibold text-blue-600'>{completionPercentage}%</span>
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-2'>
                                        <div 
                                            className='bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300'
                                            style={{ width: `${completionPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className='text-xs text-gray-600 mt-2'>
                                        Complete your profile to get better job recommendations
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className='bg-white rounded-xl shadow-sm mb-8'>
                        <nav className='flex flex-wrap border-b border-gray-200'>
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'experience', label: 'Experience' },
                                { id: 'education', label: 'Education' },
                                { id: 'skills', label: 'Skills' },
                                { id: 'certifications', label: 'Certifications' },
                                { id: 'preferences', label: 'Job Preferences' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className='p-8'>
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className='space-y-6'>
                                    {/* Resume Upload Section */}
                                    <div className="mb-6">
                                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Resume</h3>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 p-4 border border-gray-300 rounded-lg">
                                                {userData?.resume ? (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <img src={assets.resume_selected} alt="Resume" className="w-8 h-8" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">Current Resume</p>
                                                                <a href={userData.resume} target="_blank" rel="noopener noreferrer" 
                                                                   className="text-sm text-blue-600 hover:text-blue-800">
                                                                    View Resume
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <label className="cursor-pointer px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
                                                            Update
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={handleResumeUpload}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <img src={assets.resume_not_selected} alt="No Resume" className="w-16 h-16 mx-auto mb-2" />
                                                        <p className="text-gray-500 mb-2">No resume uploaded yet</p>
                                                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                            <span>Upload Resume</span>
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={handleResumeUpload}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                                {uploadProgress && (
                                                    <div className="mt-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>About</h3>
                                        {isEditing ? (
                                            <textarea
                                                value={profile.personalInfo.about}
                                                onChange={(e) => setProfile(prev => ({
                                                    ...prev,
                                                    personalInfo: { ...prev.personalInfo, about: e.target.value }
                                                }))}
                                                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32'
                                                placeholder='Tell us about yourself, your experience, and career goals...'
                                            />
                                        ) : (
                                            <p className='text-gray-600 leading-relaxed'>
                                                {profile.personalInfo.about || 'Add a description about yourself to help employers understand your background and career goals.'}
                                            </p>
                                        )}
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Resume</label>
                                            {isEditing ? (
                                                <div className='flex items-center gap-2'>
                                                    <label className='flex items-center cursor-pointer' htmlFor="resumeUpload">
                                                        <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>
                                                            {resume ? resume.name : "Select Resume"}
                                                        </p>
                                                        <input 
                                                            id='resumeUpload' 
                                                            onChange={(e) => setResume(e.target.files[0])} 
                                                            accept='application/pdf' 
                                                            type="file" 
                                                            hidden 
                                                        />
                                                        <img src={assets.profile_upload_icon} alt="Upload" />
                                                    </label>
                                                </div>
                                            ) : (
                                                <p className='text-gray-600'>
                                                    {userData && userData.resume ? (
                                                        <a href={userData.resume} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                                                            View Resume
                                                        </a>
                                                    ) : 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={profile.personalInfo.phone}
                                                    onChange={(e) => setProfile(prev => ({
                                                        ...prev,
                                                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                                                    }))}
                                                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                    placeholder='+91 9876543210'
                                                />
                                            ) : (
                                                <p className='text-gray-600'>{profile.personalInfo.phone || 'Not provided'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-2'>Website/Portfolio</label>
                                            {isEditing ? (
                                                <input
                                                    type="url"
                                                    value={profile.personalInfo.website}
                                                    onChange={(e) => setProfile(prev => ({
                                                        ...prev,
                                                        personalInfo: { ...prev.personalInfo, website: e.target.value }
                                                    }))}
                                                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                    placeholder='https://yourwebsite.com'
                                                />
                                            ) : (
                                                <p className='text-gray-600'>
                                                    {profile.personalInfo.website ? (
                                                        <a href={profile.personalInfo.website} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                                                            {profile.personalInfo.website}
                                                        </a>
                                                    ) : 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Experience Tab */}
                            {activeTab === 'experience' && (
                                <div className='space-y-6'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='text-lg font-semibold text-gray-800'>Work Experience</h3>
                                    </div>

                                    {/* Add Experience Form */}
                                    <div className='bg-gray-50 rounded-lg p-6'>
                                        <h4 className='font-medium text-gray-800 mb-4'>Add Experience</h4>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                            <input
                                                type="text"
                                                placeholder="Job Title"
                                                value={newExperience.title}
                                                onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Company Name"
                                                value={newExperience.company}
                                                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Location"
                                                value={newExperience.location}
                                                onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <div className='flex gap-2'>
                                                <input
                                                    type="month"
                                                    placeholder="Start Date"
                                                    value={newExperience.startDate}
                                                    onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                                                    className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                />
                                                {!newExperience.current && (
                                                    <input
                                                        type="month"
                                                        placeholder="End Date"
                                                        value={newExperience.endDate}
                                                        onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                                                        className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <label className='flex items-center gap-2 mb-4'>
                                            <input
                                                type="checkbox"
                                                checked={newExperience.current}
                                                onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))}
                                                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                            />
                                            <span className='text-sm text-gray-700'>I currently work here</span>
                                        </label>

                                        <textarea
                                            placeholder="Describe your role and achievements..."
                                            value={newExperience.description}
                                            onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24'
                                        />

                                        <button
                                            onClick={addExperience}
                                            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                        >
                                            Add Experience
                                        </button>
                                    </div>

                                    {/* Experience List */}
                                    <div className='space-y-4'>
                                        {profile.experience.map((exp, index) => (
                                            <div key={exp.id || index} className='border border-gray-200 rounded-lg p-6'>
                                                <div className='flex justify-between items-start mb-2'>
                                                    <div>
                                                        <h4 className='font-semibold text-gray-800'>{exp.title}</h4>
                                                        <p className='text-blue-600 font-medium'>{exp.company}</p>
                                                        <p className='text-gray-500 text-sm'>{exp.location}</p>
                                                        <p className='text-gray-500 text-sm'>
                                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setProfile(prev => ({
                                                            ...prev,
                                                            experience: prev.experience.filter((_, i) => i !== index)
                                                        }))}
                                                        className='text-red-500 hover:text-red-700'
                                                    >
                                                        <img src={assets.delete_icon} alt="" className='h-4 w-4' />
                                                    </button>
                                                </div>
                                                <p className='text-gray-600 text-sm mt-3'>{exp.description}</p>
                                            </div>
                                        ))}
                                        
                                        {profile.experience.length === 0 && (
                                            <p className='text-center text-gray-500 py-8'>No work experience added yet</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Education Tab */}
                            {activeTab === 'education' && (
                                <div className='space-y-6'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='text-lg font-semibold text-gray-800'>Education</h3>
                                    </div>

                                    {/* Add Education Form */}
                                    <div className='bg-gray-50 rounded-lg p-6'>
                                        <h4 className='font-medium text-gray-800 mb-4'>Add Education</h4>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                            <input
                                                type="text"
                                                placeholder="Degree (e.g., Bachelor of Engineering)"
                                                value={newEducation.degree}
                                                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Institution Name"
                                                value={newEducation.institution}
                                                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Field of Study (e.g., Computer Science)"
                                                value={newEducation.fieldOfStudy}
                                                onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Grade/CGPA (optional)"
                                                value={newEducation.grade}
                                                onChange={(e) => setNewEducation(prev => ({ ...prev, grade: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="number"
                                                placeholder="Start Year"
                                                value={newEducation.startYear}
                                                onChange={(e) => setNewEducation(prev => ({ ...prev, startYear: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                min="1950"
                                                max="2030"
                                            />
                                            <input
                                                type="number"
                                                placeholder="End Year"
                                                value={newEducation.endYear}
                                                onChange={(e) => setNewEducation(prev => ({ ...prev, endYear: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                min="1950"
                                                max="2030"
                                            />
                                        </div>

                                        <button
                                            onClick={addEducation}
                                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                        >
                                            Add Education
                                        </button>
                                    </div>

                                    {/* Education List */}
                                    <div className='space-y-4'>
                                        {profile.education.map((edu, index) => (
                                            <div key={edu.id || index} className='border border-gray-200 rounded-lg p-6'>
                                                <div className='flex justify-between items-start mb-2'>
                                                    <div>
                                                        <h4 className='font-semibold text-gray-800'>{edu.degree}</h4>
                                                        <p className='text-blue-600 font-medium'>{edu.institution}</p>
                                                        <p className='text-gray-500 text-sm'>{edu.fieldOfStudy}</p>
                                                        <p className='text-gray-500 text-sm'>
                                                            {edu.startYear} - {edu.endYear}
                                                            {edu.grade && <span className='ml-2'>• Grade: {edu.grade}</span>}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setProfile(prev => ({
                                                            ...prev,
                                                            education: prev.education.filter((_, i) => i !== index)
                                                        }))}
                                                        className='text-red-500 hover:text-red-700'
                                                    >
                                                        <img src={assets.delete_icon} alt="" className='h-4 w-4' />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {profile.education.length === 0 && (
                                            <p className='text-center text-gray-500 py-8'>No education added yet</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Skills Tab */}
                            {activeTab === 'skills' && (
                                <div className='space-y-6'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='text-lg font-semibold text-gray-800'>Skills</h3>
                                    </div>

                                    {/* Add Skill Form */}
                                    <div className='flex gap-3'>
                                        <input
                                            type="text"
                                            placeholder="Add a skill (e.g., React, Python, Marketing)"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    addSkill()
                                                }
                                            }}
                                            className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        />
                                        <button
                                            onClick={addSkill}
                                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                        >
                                            Add Skill
                                        </button>
                                    </div>

                                    {/* Skills List */}
                                    <div className='flex flex-wrap gap-3'>
                                        {profile.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'
                                            >
                                                {skill}
                                                <button
                                                    onClick={() => removeSkill(skill)}
                                                    className='hover:text-blue-600 transition-colors'
                                                >
                                                    <img src={assets.cross_icon} alt="Remove" className='h-3 w-3' />
                                                </button>
                                            </span>
                                        ))}
                                        
                                        {profile.skills.length === 0 && (
                                            <p className='text-center text-gray-500 py-8 w-full'>No skills added yet</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Certifications Tab */}
                            {activeTab === 'certifications' && (
                                <div className='space-y-6'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='text-lg font-semibold text-gray-800'>Certifications</h3>
                                    </div>

                                    {/* Add Certification Form */}
                                    <div className='bg-gray-50 rounded-lg p-6'>
                                        <h4 className='font-medium text-gray-800 mb-4'>Add Certification</h4>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                            <input
                                                type="text"
                                                placeholder="Certification Name"
                                                value={newCertification.name}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Issuing Organization"
                                                value={newCertification.issuer}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="month"
                                                placeholder="Issue Date"
                                                value={newCertification.issueDate}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, issueDate: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="text"
                                                placeholder="Credential ID (optional)"
                                                value={newCertification.credentialId}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, credentialId: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            />
                                            <input
                                                type="url"
                                                placeholder="Credential URL (optional)"
                                                value={newCertification.credentialUrl}
                                                onChange={(e) => setNewCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
                                                className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2'
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (newCertification.name && newCertification.issuer) {
                                                    setProfile(prev => ({
                                                        ...prev,
                                                        certifications: [...prev.certifications, { ...newCertification, id: Date.now() }]
                                                    }))
                                                    setNewCertification({
                                                        name: '',
                                                        issuer: '',
                                                        issueDate: '',
                                                        credentialId: '',
                                                        credentialUrl: ''
                                                    })
                                                }
                                            }}
                                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                                        >
                                            Add Certification
                                        </button>
                                    </div>

                                    {/* Certifications List */}
                                    <div className='space-y-4'>
                                        {profile.certifications.map((cert, index) => (
                                            <div key={cert.id || index} className='border border-gray-200 rounded-lg p-6'>
                                                <div className='flex justify-between items-start mb-2'>
                                                    <div>
                                                        <h4 className='font-semibold text-gray-800'>{cert.name}</h4>
                                                        <p className='text-blue-600 font-medium'>{cert.issuer}</p>
                                                        <p className='text-gray-500 text-sm'>
                                                            Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                                        </p>
                                                        {cert.credentialId && (
                                                            <p className='text-gray-500 text-sm'>Credential ID: {cert.credentialId}</p>
                                                        )}
                                                        {cert.credentialUrl && (
                                                            <a 
                                                                href={cert.credentialUrl} 
                                                                target='_blank' 
                                                                rel='noopener noreferrer'
                                                                className='text-blue-600 text-sm hover:underline'
                                                            >
                                                                View Credential
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setProfile(prev => ({
                                                            ...prev,
                                                            certifications: prev.certifications.filter((_, i) => i !== index)
                                                        }))}
                                                        className='text-red-500 hover:text-red-700'
                                                    >
                                                        <img src={assets.delete_icon} alt="" className='h-4 w-4' />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {profile.certifications.length === 0 && (
                                            <p className='text-center text-gray-500 py-8'>No certifications added yet</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Job Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className='space-y-6'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='text-lg font-semibold text-gray-800'>Job Preferences</h3>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                        {/* Job Types */}
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-3'>Preferred Job Types</label>
                                            <div className='space-y-2'>
                                                {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(type => (
                                                    <label key={type} className='flex items-center gap-2'>
                                                        <input
                                                            type="checkbox"
                                                            checked={profile.preferences.jobTypes.includes(type)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setProfile(prev => ({
                                                                        ...prev,
                                                                        preferences: {
                                                                            ...prev.preferences,
                                                                            jobTypes: [...prev.preferences.jobTypes, type]
                                                                        }
                                                                    }))
                                                                } else {
                                                                    setProfile(prev => ({
                                                                        ...prev,
                                                                        preferences: {
                                                                            ...prev.preferences,
                                                                            jobTypes: prev.preferences.jobTypes.filter(t => t !== type)
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                                        />
                                                        <span className='text-gray-700'>{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Work Mode */}
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-3'>Work Mode</label>
                                            <div className='space-y-2'>
                                                {['Remote', 'Hybrid', 'On-site'].map(mode => (
                                                    <label key={mode} className='flex items-center gap-2'>
                                                        <input
                                                            type="checkbox"
                                                            checked={profile.preferences.workMode.includes(mode)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setProfile(prev => ({
                                                                        ...prev,
                                                                        preferences: {
                                                                            ...prev.preferences,
                                                                            workMode: [...prev.preferences.workMode, mode]
                                                                        }
                                                                    }))
                                                                } else {
                                                                    setProfile(prev => ({
                                                                        ...prev,
                                                                        preferences: {
                                                                            ...prev.preferences,
                                                                            workMode: prev.preferences.workMode.filter(m => m !== mode)
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                                        />
                                                        <span className='text-gray-700'>{mode}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Salary Range */}
                                        <div className='md:col-span-2'>
                                            <label className='block text-sm font-medium text-gray-700 mb-3'>Expected Salary Range (₹ per annum)</label>
                                            <div className='flex gap-4'>
                                                <input
                                                    type="number"
                                                    placeholder="Minimum"
                                                    value={profile.preferences.salaryRange.min}
                                                    onChange={(e) => setProfile(prev => ({
                                                        ...prev,
                                                        preferences: {
                                                            ...prev.preferences,
                                                            salaryRange: { ...prev.preferences.salaryRange, min: e.target.value }
                                                        }
                                                    }))}
                                                    className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                />
                                                <span className='flex items-center text-gray-500'>to</span>
                                                <input
                                                    type="number"
                                                    placeholder="Maximum"
                                                    value={profile.preferences.salaryRange.max}
                                                    onChange={(e) => setProfile(prev => ({
                                                        ...prev,
                                                        preferences: {
                                                            ...prev.preferences,
                                                            salaryRange: { ...prev.preferences.salaryRange, max: e.target.value }
                                                        }
                                                    }))}
                                                    className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                />
                                            </div>
                                        </div>

                                        {/* Preferred Locations */}
                                        <div className='md:col-span-2'>
                                            <label className='block text-sm font-medium text-gray-700 mb-3'>Preferred Locations</label>
                                            <div className='flex gap-3 mb-3'>
                                                <input
                                                    type="text"
                                                    placeholder="Add location (e.g., Mumbai, Delhi, Bangalore)"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            const location = e.target.value.trim()
                                                            if (location && !profile.preferences.locations.includes(location)) {
                                                                setProfile(prev => ({
                                                                    ...prev,
                                                                    preferences: {
                                                                        ...prev.preferences,
                                                                        locations: [...prev.preferences.locations, location]
                                                                    }
                                                                }))
                                                                e.target.value = ''
                                                            }
                                                        }
                                                    }}
                                                    className='flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                />
                                            </div>
                                            <div className='flex flex-wrap gap-2'>
                                                {profile.preferences.locations.map((location, index) => (
                                                    <span
                                                        key={index}
                                                        className='inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'
                                                    >
                                                        {location}
                                                        <button
                                                            onClick={() => setProfile(prev => ({
                                                                ...prev,
                                                                preferences: {
                                                                    ...prev.preferences,
                                                                    locations: prev.preferences.locations.filter((_, i) => i !== index)
                                                                }
                                                            }))}
                                                            className='hover:text-gray-900 transition-colors'
                                                        >
                                                            <img src={assets.cross_icon} alt="Remove" className='h-3 w-3' />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className='px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                                    >
                                        {loading ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            )}

                            {isEditing && activeTab !== 'experience' && activeTab !== 'skills' && activeTab !== 'education' && activeTab !== 'certifications' && activeTab !== 'preferences' && (
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className='mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default UserProfile