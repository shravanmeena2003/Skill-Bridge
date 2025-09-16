import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

// Configure axios defaults
axios.defaults.withCredentials = true;

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const { user } = useUser()
    const { getToken } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: '',
        experience: ''
    })

    const [isSearched, setIsSearched] = useState(false)

    const [jobs, setJobs] = useState([])

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])

    // Function to Fetch Jobs 
    const fetchJobs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/jobs', {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (data.success) {
                setJobs(data.jobs)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to Fetch Company Data
    const fetchCompanyData = async () => {
        try {
            if (!companyToken) {
                console.log('No company token available');
                return;
            }

            const { data } = await axios.get(backendUrl + '/api/company/company', {
                headers: {
                    'Content-Type': 'application/json',
                    'token': companyToken, // Send token in both formats for compatibility
                    'Authorization': `Bearer ${companyToken}`
                }
            });

            if (data.success) {
                setCompanyData(data.company);
            } else {
                toast.error(data.message || 'Failed to fetch company data');
            }

        } catch (error) {
            console.error('Fetch company data error:', error);
            if (error.response) {
                toast.error(error.response.data?.message || 'Failed to fetch company data');
            } else if (error.request) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('An error occurred while fetching company data');
            }
        }
    }
    
    // Function to Update Company Profile
    const updateCompanyProfile = async (profileData) => {
        try {
            const { data } = await axios.put(backendUrl + '/api/company/update-profile', profileData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${companyToken}`
                },
                withCredentials: true
            });

            if (data.success) {
                setCompanyData(data.company);
                toast.success('Profile updated successfully');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }

        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    // Function to Fetch User Data
    const fetchUserData = async () => {
        try {
            if (!user) {
                console.log('No user is logged in, skipping user data fetch');
                return;
            }

            const token = await getToken();
            if (!token) {
                console.error('Failed to get authentication token');
                return;
            }

            console.log('Fetching user data with token...');
            const { data } = await axios.get(backendUrl + '/api/users/user',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                console.log('User data fetched successfully');
                setUserData(data.user);
            } else {
                console.error('Failed to fetch user data:', data.message);
                
                // If user not found, we need to create the user in our database
                if (data.message === 'User Not Found' && user) {
                    console.log('User not found in database, creating user profile...');
                    await createUserProfile();
                } else {
                    toast.error(data.message);
                }
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to fetch user data. Please try again.');
        }
    }

    // Function to create user profile in our database
    const createUserProfile = async () => {
        try {
            if (!user) {
                console.log('No user is logged in, cannot create profile');
                return;
            }

            const token = await getToken();
            if (!token) {
                console.error('Failed to get authentication token');
                return;
            }

            // Create a basic user profile with data from Clerk
            console.log('Clerk user data:', {
                id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl
            });

            const userData = {
                _id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                image: user.imageUrl,
                resume: ''
            };

            if (!userData._id || !userData.email || !userData.name.trim()) {
                console.error('Missing required user data:', {
                    hasId: !!userData._id,
                    hasEmail: !!userData.email,
                    hasName: !!userData.name.trim()
                });
                toast.error('Missing required user information');
                return;
            }

            console.log('Creating user profile with data:', userData);
            
            // Make a POST request to create the user
            console.log('Making request to:', backendUrl + '/api/users/create-profile');
            const response = await axios.post(backendUrl + '/api/users/create-profile', 
                userData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Server response:', response.data);

            if (response.data.success) {
                console.log('User profile created successfully:', response.data.user);
                setUserData(response.data.user);
                toast.success('Profile created successfully');
            } else {
                console.error('Failed to create user profile:', {
                    message: response.data.message,
                    status: response.status
                });
                toast.error(response.data.message || 'Failed to create profile');
            }

        } catch (error) {
            console.error('Error creating user profile:', error);
            toast.error('Failed to create user profile. Please try again.');
        }
    }

    // Function to Fetch User's Applied Applications
    const fetchUserApplications = async () => {
        try {
            if (!user) {
                console.log('No user is logged in, skipping applications fetch');
                return;
            }

            const token = await getToken();
            if (!token) {
                console.error('Failed to get authentication token for applications');
                return;
            }

            console.log('Fetching user applications with token...');
            const { data } = await axios.get(backendUrl + '/api/users/applications',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                console.log('User applications fetched successfully:', data.applications.length);
                setUserApplications(data.applications);
            } else {
                console.error('Failed to fetch user applications:', data.message);
                toast.error(data.message);
            }

        } catch (error) {
            console.error('Error fetching user applications:', error);
            toast.error('Failed to fetch your applications. Please try again.');
        }
    }

    // Retrieve and validate Company Token From LocalStorage
    useEffect(() => {
        fetchJobs()

        const storedCompanyToken = localStorage.getItem('companyToken')

        if (storedCompanyToken) {
            // Validate token by making a request
            axios.get(backendUrl + '/api/company/company', {
                headers: {
                    'Authorization': `Bearer ${storedCompanyToken}`
                }
            }).then(({data}) => {
                if (data.success) {
                    setCompanyToken(storedCompanyToken)
                } else {
                    // Token invalid, clear it
                    localStorage.removeItem('companyToken')
                    setCompanyToken(null)
                    setCompanyData(null)
                }
            }).catch(() => {
                // Token invalid or expired, clear it
                localStorage.removeItem('companyToken')
                setCompanyToken(null)
                setCompanyData(null)
            })
        }

    }, [])

    // Fetch Company Data if Company Token is Available
    useEffect(() => {
        if (companyToken) {
            fetchCompanyData()
        }
    }, [companyToken])

    // Fetch User's Applications & Data if User is Logged In
    useEffect(() => {
        if (user) {
            console.log('User logged in, fetching user data and applications');
            // Add a small delay to ensure Clerk auth is fully initialized
            const timer = setTimeout(() => {
                fetchUserData();
                fetchUserApplications();
            }, 500);
            
            return () => clearTimeout(timer);
        } else {
            // Clear user data when logged out
            setUserData(null);
            setUserApplications([]);
        }
    }, [user])

    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        fetchCompanyData,
        updateCompanyProfile,
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}