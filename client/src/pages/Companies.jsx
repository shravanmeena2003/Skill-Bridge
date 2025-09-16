import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    industry: '',
    size: '',
    search: ''
  })

  useEffect(() => {
    fetchCompanies()
    // eslint-disable-next-line
  }, [page, filters])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page,
        ...filters
      })
      const response = await axios.get(`http://localhost:5000/api/companies?${queryParams}`)
      setCompanies(response.data.companies)
      setTotalPages(response.data.pagination.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-red-600">Error: {error}</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Featured Companies</h1>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search companies..."
            className="border rounded-lg px-4 py-2"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.industry}
            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>
          <select
            className="border rounded-lg px-4 py-2"
            value={filters.size}
            onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
          >
            <option value="">All Company Sizes</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">No companies found.</div>
          ) : companies.map((company) => (
            <div key={company._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <Link to={`/companies/${company._id}`} className="block">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src={company.image || assets.company_placeholder} 
                    alt={`${company.name} logo`} 
                    className="h-12 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">{company.name}</h3>
                <p className="text-gray-600 text-center mb-2">{company.industry}</p>
                <div className="text-gray-500 text-sm text-center mb-4">
                  <span className="flex items-center justify-center gap-2">
                    <img src={assets.location_icon} alt="Location" className="w-4 h-4" />
                    {company.location}
                  </span>
                </div>
              </Link>
              <div className="flex justify-center space-x-4 mt-4">
                <Link 
                  to={`/jobs?company=${company._id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Jobs
                </Link>
                {company.website && (
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <div className="px-4 py-2">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded ${
                page === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Companies
