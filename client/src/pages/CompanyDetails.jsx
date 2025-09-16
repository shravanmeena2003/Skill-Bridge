import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { assets } from '../assets/assets'

const CompanyDetails = () => {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/api/companies/${id}`)
        setCompany(response.data.company)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-xl">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-600">Error: {error || 'Company not found'}</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={company.image} 
              alt={`${company.name} logo`} 
              className="h-24 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">{company.name}</h1>
          <p className="text-gray-600 text-center mb-4">{company.industry}</p>
          <div className="flex items-center justify-center gap-4 text-gray-600 mb-6">
            <span className="flex items-center gap-2">
              <img src={assets.location_icon} alt="Location" className="w-4 h-4" />
              {company.location}
            </span>
            <span className="flex items-center gap-2">
              <img src={assets.users_icon} alt="Company size" className="w-4 h-4" />
              {company.size} employees
            </span>
          </div>
          {company.website && (
            <div className="text-center">
              <a 
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2"
              >
                Visit Website
                <img src={assets.right_arrow_icon} alt="Visit" className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">About {company.name}</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{company.about || 'No company description available.'}</p>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Founded</h3>
              <p className="text-gray-600">{company.foundedYear || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Industry</h3>
              <p className="text-gray-600">{company.industry}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Company Size</h3>
              <p className="text-gray-600">{company.size} employees</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Location</h3>
              <p className="text-gray-600">{company.location}</p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        {company.socialMedia && Object.values(company.socialMedia).some(Boolean) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Connect With Us</h2>
            <div className="flex justify-center gap-6">
              {company.socialMedia.linkedin && (
                <a 
                  href={company.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600"
                >
                  LinkedIn
                </a>
              )}
              {company.socialMedia.twitter && (
                <a 
                  href={company.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-400"
                >
                  Twitter
                </a>
              )}
              {company.socialMedia.facebook && (
                <a 
                  href={company.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-800"
                >
                  Facebook
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default CompanyDetails