import { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary']
const employmentTypes = ['Permanent', 'Contractual', 'Freelance', 'Remote', 'Hybrid']
const industries = ['IT', 'Healthcare', 'Banking', 'Education', 'Manufacturing', 'Retail', 'Hospitality']
const roleCategories = ['Software Development', 'Data Science', 'Design', 'Product Management', 'Marketing', 'Sales', 'Operations']
const educationQualifications = ['Diploma', 'Graduate', 'Post Graduate', 'Doctorate']
const noticePeriods = ['Immediate', '15 days', '30 days', '60 days']
const genders = ['Any', 'Male', 'Female', 'Other']
const salaryTypes = ['Monthly', 'Yearly', 'Hourly']
const currencies = ['INR', 'USD', 'EUR', 'GBP']
const countries = ['India', 'United States', 'United Kingdom']

const AddJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    const [title, setTitle] = useState('');
    // Location breakdown
    const [country, setCountry] = useState('India')
    const [stateName, setStateName] = useState('Karnataka')
    const [city, setCity] = useState('Bangalore')
    const [location, setLocation] = useState('Bangalore');
    const [category, setCategory] = useState('Programming');
    const [level, setLevel] = useState('Beginner level');
    const [salary, setSalary] = useState({ min: 0, max: 0 });
    const [jobType, setJobType] = useState('Full-time');
    const [employmentType, setEmploymentType] = useState('Permanent');
    const [experience, setExperience] = useState({ min: 0, max: 0 });
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [benefits, setBenefits] = useState([]);
    const [newBenefit, setNewBenefit] = useState('');
    const [requirements, setRequirements] = useState([]);
    const [newRequirement, setNewRequirement] = useState('');
    const [responsibilities, setResponsibilities] = useState([]);
    const [newResponsibility, setNewResponsibility] = useState('');
    const [workMode, setWorkMode] = useState('On-site');
    const [applicationDeadline, setApplicationDeadline] = useState('');

    // Additional fields
    const [industry, setIndustry] = useState('IT')
    const [functionalArea, setFunctionalArea] = useState('')
    const [roleCategory, setRoleCategory] = useState('Software Development')
    const [designation, setDesignation] = useState('')
    const [vacancies, setVacancies] = useState(1)
    const [educationQualification, setEducationQualification] = useState('Graduate')
    const [specialization, setSpecialization] = useState('')
    const [languages, setLanguages] = useState([])
    const [newLanguage, setNewLanguage] = useState('')
    const [noticePeriod, setNoticePeriod] = useState('Immediate')
    const [preferredLocation, setPreferredLocation] = useState('')
    const [genderPreference, setGenderPreference] = useState('Any')
    const [ageLimit, setAgeLimit] = useState('')
    const [salaryType, setSalaryType] = useState('Yearly')
    const [currency, setCurrency] = useState('INR')
    const [otherBenefits, setOtherBenefits] = useState('')

    const editorRef = useRef(null)
    const quillRef = useRef(null)

    const { backendUrl, companyToken } = useContext(AppContext)

    const handleAddItem = (item, list, setList, setNewItem) => {
        if (item.trim()) {
            setList([...list, item.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index, list, setList) => {
        setList(list.filter((_, i) => i !== index));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const description = quillRef.current.root.innerHTML;
            
            // Validate required fields
            if (!title.trim()) {
                toast.error('Job title is required');
                return;
            }

            if (!description.trim() || description === '<p><br></p>') {
                toast.error('Job description is required');
                return;
            }

            // Validate salary range
            if (salary.min > salary.max) {
                toast.error('Minimum salary cannot be greater than maximum salary');
                return;
            }

            // Validate experience range
            if (experience.min > experience.max) {
                toast.error('Minimum experience cannot be greater than maximum experience');
                return;
            }

            // Validate skills
            if (skills.length === 0) {
                toast.error('At least one skill is required');
                return;
            }

            // Build combined location string visible to current API
            const computedLocation = city && stateName && country 
                ? `${city}, ${stateName}, ${country}` 
                : location

            const jobData = {
                title,
                description,
                location: computedLocation,
                category,
                level,
                salary: {
                    min: parseFloat(salary.min),
                    max: parseFloat(salary.max)
                },
                type: jobType,
                workMode,
                requirements,
                responsibilities,
                benefits: otherBenefits ? [...benefits, otherBenefits] : benefits,
                skills,
                applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
                status: 'active'
            };

            // Attach optional details (ignored by current backend schema, but future-proof)
            jobData.details = {
                employmentType,
                industry,
                functionalArea,
                roleCategory,
                designation,
                vacancies,
                experience,
                educationQualification,
                specialization,
                languages,
                noticePeriod,
                preferredLocation,
                genderPreference,
                ageLimit,
                salaryType,
                currency,
                country,
                state: stateName,
                city
            }

            if (!companyToken) {
                toast.error('Authentication token missing. Please login again.');
                return;
            }

            if (!companyToken) {
                toast.error('Authentication token missing. Please login again.');
                return;
            }

            let response;
            if (id) {
                // Update existing job
                response = await axios.put(
                    `${backendUrl}/api/jobs/${id}`,
                    jobData,
                    { 
                        headers: { 
                            Authorization: `Bearer ${companyToken}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );
            } else {
                // Create new job
                response = await axios.post(
                    `${backendUrl}/api/jobs`,
                    jobData,
                    { 
                        headers: { 
                            Authorization: `Bearer ${companyToken}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );
            }

            const { data } = response;

            if (data.success) {
                toast.success(id ? 'Job updated successfully' : 'Job created successfully');
                navigate('/dashboard/manage-jobs');
            } else {
                toast.error(data.message || 'Operation failed. Please try again.');
            }
        } catch (error) {
            setIsLoading(false);
            toast.error(error.response?.data?.message || error.message || 'An error occurred while saving the job');
        } finally {
            setIsLoading(false);
        }
    }


    const fetchJobDetails = async () => {
        try {
            setIsLoading(true);
            
            if (!companyToken) {
                toast.error('Authentication token missing. Please login again.');
                navigate('/dashboard/manage-jobs');
                return;
            }

            const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`, {
                headers: { Authorization: `Bearer ${companyToken}` }
            });
            
            if (data.success && data.job) {
                const job = data.job;
                setTitle(job.title || '');
                setLocation(job.location || 'Bangalore');
                setCategory(job.category || 'Programming');
                setLevel(job.level || 'Beginner level');
                setSalary({
                    min: job.salary?.min || 0,
                    max: job.salary?.max || 0,
                    currency: 'USD'
                });
                setJobType(job.type || 'Full-time');
                setSkills(Array.isArray(job.skills) ? job.skills : []);
                setBenefits(Array.isArray(job.benefits) ? job.benefits : []);
                setRequirements(Array.isArray(job.requirements) ? job.requirements : []);
                setResponsibilities(Array.isArray(job.responsibilities) ? job.responsibilities : []);
                setWorkMode(job.workMode || 'On-site');
                setApplicationDeadline(job.applicationDeadline ? 
                    new Date(job.applicationDeadline).toISOString().split('T')[0] : '');
                
                if (quillRef.current) {
                    quillRef.current.root.innerHTML = job.description || '';
                }
            } else {
                toast.error(data.message || 'Job not found');
                navigate('/dashboard/manage-jobs');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch job details');
            navigate('/dashboard/manage-jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitialJobDescription = () => {
        return `<h2>About the Role</h2>
<p>We are seeking a talented professional to join our team. In this role, you will be responsible for...</p>

<h2>Key Responsibilities</h2>
<ul>
<li>Drive project initiatives and contribute to team success</li>
<li>Collaborate with cross-functional teams</li>
<li>Implement best practices and maintain high standards</li>
</ul>

<h2>What You'll Do</h2>
<ul>
<li>Design and develop solutions for complex problems</li>
<li>Participate in team meetings and planning sessions</li>
<li>Mentor junior team members</li>
</ul>

<h2>Your Growth Opportunity</h2>
<p>This role offers opportunities for:</p>
<ul>
<li>Professional development and skill enhancement</li>
<li>Leadership growth</li>
<li>Industry exposure</li>
</ul>

<h2>Work Environment</h2>
<p>We offer a collaborative and innovative work environment where you'll:</p>
<ul>
<li>Work with cutting-edge technologies</li>
<li>Participate in knowledge sharing sessions</li>
<li>Contribute to a positive team culture</li>
</ul>`;
    };

    useEffect(() => {
        // Initiate Quill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['clean']
                    ]
                }
            });

            // If editing existing job, fetch its details, otherwise set template
            if (id) {
                fetchJobDetails();
            }
        }
    }, [id, backendUrl, companyToken]); // Add proper dependencies

    if (isLoading) {
        return (
            <div className='container p-4 w-full h-96 flex items-center justify-center'>
                <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmitHandler} className='container mx-auto p-6 max-w-4xl bg-white shadow-sm rounded-lg'>
            <div className='w-full flex justify-between items-center border-b pb-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>{id ? 'Edit Job Posting' : 'Create New Job Posting'}</h1>
                    <p className='text-gray-500 text-sm mt-1'>Fill in the details below to post a new job opening</p>
                </div>
                {id && (
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard/manage-jobs')}
                        className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium'
                    >
                        Cancel
                    </button>
                )}
            </div>
            
            <div className='space-y-8'>
                {/* Essential Information */}
                <div className='space-y-4'>
                    <h2 className='text-lg font-semibold text-gray-800'>Essential Information</h2>
                    
                    {/* Job Title */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Job Title */}
                        <div className='form-section col-span-2'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Job Title <span className='text-red-500'>*</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder='e.g., Senior Software Engineer'
                                onChange={e => setTitle(e.target.value)} 
                                value={title}
                                required
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors'
                            />
                        </div>

                        {/* Job Category */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Category <span className='text-red-500'>*</span>
                            </label>
                            <select 
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none' 
                                onChange={e => setCategory(e.target.value)} 
                                value={category}
                                required
                            >
                                {JobCategories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Job Location */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Location <span className='text-red-500'>*</span>
                            </label>
                            <select 
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                onChange={e => setLocation(e.target.value)} 
                                value={location}
                                required
                            >
                                {JobLocations.map((loc, index) => (
                                    <option key={index} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                <div className='space-y-4 mt-8'>
                    <h2 className='text-lg font-semibold text-gray-800'>Job Description</h2>
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Write a compelling job description <span className='text-red-500'>*</span>
                        </label>
                        <div className='bg-white border border-gray-300 rounded-lg'>
                            <div ref={editorRef} className='min-h-[300px]'></div>
                        </div>
                        <p className='text-sm text-gray-500'>
                            Use the editor to describe the role, responsibilities, requirements, and benefits. 
                            Format your content to make it easy to read.
                        </p>
                    </div>
                </div>

                {/* Employment Details */}
                <div className='space-y-4 mt-8'>
                    <h2 className='text-lg font-semibold text-gray-800'>Employment Details</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {/* Employment Type */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Employment Type <span className='text-red-500'>*</span>
                            </label>
                            <select 
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                onChange={e => setEmploymentType(e.target.value)} 
                                value={employmentType}
                                required
                            >
                                {employmentTypes.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Experience Required */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Experience (Years) <span className='text-red-500'>*</span>
                            </label>
                            <div className='flex gap-2'>
                                <input 
                                    type="number" 
                                    placeholder='Min'
                                    min="0"
                                    className='w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    value={experience.min}
                                    onChange={e => setExperience({ ...experience, min: parseInt(e.target.value) })}
                                />
                                <input 
                                    type="number"
                                    placeholder='Max'
                                    min="0"
                                    className='w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    value={experience.max}
                                    onChange={e => setExperience({ ...experience, max: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Salary Range */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Salary & Benefits</label>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                                <input type='number' placeholder='Minimum Salary' min='0' step='0.1'
                                    value={salary.min} onChange={e => setSalary({ ...salary, min: parseFloat(e.target.value) })}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none' />
                                <input type='number' placeholder='Maximum Salary' min='0' step='0.1'
                                    value={salary.max} onChange={e => setSalary({ ...salary, max: parseFloat(e.target.value) })}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none' />
                                <select value={salaryType} onChange={e => setSalaryType(e.target.value)}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'>
                                    {salaryTypes.map((st, i) => <option key={i} value={st}>{st}</option>)}
                                </select>
                                <select value={currency} onChange={e => setCurrency(e.target.value)}
                                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'>
                                    {currencies.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <textarea placeholder='Other Benefits/Perks (e.g., insurance, meals, remote work, etc.)' value={otherBenefits}
                                onChange={e => setOtherBenefits(e.target.value)} rows={3}
                                className='mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none' />
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className='space-y-4 mt-8'>
                    <h2 className='text-lg font-semibold text-gray-800'>Additional Details</h2>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Required Skills */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Required Skills <span className='text-red-500'>*</span>
                            </label>
                            <div className='space-y-2'>
                                <div className='flex gap-2'>
                                    <input type="text" 
                                        placeholder='Add a skill'
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    />
                                    <button type="button" 
                                        onClick={() => handleAddItem(newSkill, skills, setSkills, setNewSkill)}
                                        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>
                                        Add
                                    </button>
                                </div>
                                <div className='flex flex-wrap gap-2 mt-2'>
                                    {skills.map((skill, index) => (
                                        <span key={index} 
                                            className='inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full'>
                                            {skill}
                                            <button type="button" 
                                                onClick={() => handleRemoveItem(index, skills, setSkills)}
                                                className='text-blue-500 hover:text-blue-700'>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Application Deadline */}
                        <div className='form-section'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Application Deadline
                            </label>
                            <input type="date" 
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                value={applicationDeadline}
                                onChange={e => setApplicationDeadline(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Remote Work Option */}
                    <div className='w-full p-4 bg-gray-50 rounded-lg border border-gray-200'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input type="checkbox" 
                                checked={workMode === 'Remote'}
                                onChange={e => setWorkMode(e.target.checked ? 'Remote' : 'On-site')}
                                className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                            />
                            <span className='font-medium text-gray-700'>This is a remote position</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className='mt-8 flex justify-end border-t pt-6'>
                    {id && (
                        <button type="button"
                            onClick={() => navigate('/dashboard/manage-jobs')}
                            className='px-6 py-2 mr-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'>
                            Cancel
                        </button>
                    )}
                    <button type='submit' 
                        className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                        {isLoading ? 'Saving...' : (id ? 'Update Job' : 'Post Job')}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default AddJob;