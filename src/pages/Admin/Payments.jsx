import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Admin/Sidebar'
import Navbar from '../../components/Admin/Navbar'
import { getAllMentors } from '../../services/getAllData'

export default function Payments() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await getAllMentors()
        // Filter out mentors with zero balance
        const mentorsWithBalance = response.filter(mentor => mentor.balance > 0)
        setMentors(mentorsWithBalance)
        setLoading(false)
      } catch (err) {
        setError('Failed to load mentors data')
        setLoading(false)
        console.error('Error fetching mentors:', err)
      }
    }

    fetchMentors()
  }, [])

  const formatCurrency = (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 bg-background">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
            <Sidebar />
          </div>
          <div className="flex-1 ml-80 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-secondary">Loading payments...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 bg-background">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
            <Sidebar />
          </div>
          <div className="flex-1 ml-80 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 bg-background">
        <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
          <Sidebar />
        </div>
        <div className="flex-1 ml-80 p-6 shadow-lg rounded-lg">
          <div className="bg-surface shadow-lg rounded-lg p-8 m-4 transition-theme">
            <h2 className="text-3xl font-bold text-primary mb-8 mt-8 tracking-wide">Mentor Balances</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
              <div className="card bg-green-100 p-6 rounded-lg">
                <p className="text-base font-medium text-secondary mb-2">Total Balance</p>
                <p className="text-3xl font-bold text-green-700 mb-1">
                  {formatCurrency(
                    mentors.reduce((sum, mentor) => sum + (mentor.balance || 0), 0)
                  )}
                </p>
              </div>
              <div className="card bg-blue-100 p-6 rounded-lg">
                <p className="text-base font-medium text-secondary mb-2">Mentors with Balance</p>
                <p className="text-3xl font-bold text-blue-700 mb-1">
                  {mentors.length}
                </p>
              </div>
            </div>

            {/* Mentors Balance Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-primary">Mentor Balances</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mentors.map((mentor) => (
                      <tr key={mentor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mentor.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mentor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(mentor.balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {mentor.paymentMethod || 'Stripe'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {mentors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No mentors with balance found</div>
                
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
} 