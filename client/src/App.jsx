import { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import ForgotPassword from './pages/ForgotPassword'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import UserProfile from './pages/UserProfile'
import SavedJobs from './pages/SavedJobs'
import Companies from './pages/Companies'
import CompanyDetails from './pages/CompanyDetails'
import Services from './pages/Services'
import RecruiterLogin from './components/RecruiterLogin'
import CompanyProfile from './components/CompanyProfile'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const { showRecruiterLogin, companyToken } = useContext(AppContext)

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/jobs' element={<Jobs />} />
        <Route path='/companies' element={<Companies />} />
        <Route path='/companies/:id' element={<CompanyDetails />} />
        <Route path='/services' element={<Services />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/profile' element={<UserProfile />} />
        <Route path='/saved-jobs' element={<SavedJobs />} />
        <Route path='/dashboard' element={<Dashboard />}>
          {
            companyToken ? <>
              <Route path='add-job' element={<AddJob />} />
              <Route path='add-job/:id' element={<AddJob />} />
              <Route path='manage-jobs' element={<ManageJobs />} />
              <Route path='view-applications' element={<ViewApplications />} />
              <Route path='view-applications/:id' element={<ViewApplications />} />
              <Route path='profile' element={<CompanyProfile />} />
            </> : null
          }
        </Route>
      </Routes>
    </div>
  )
}

export default App