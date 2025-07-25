import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Admin/Sidebar'
import Navbar from '../../components/Admin/Navbar'
import { getAnalytics } from '../../services/adminServices'
import { getAllUsers, getAllMentors, getAllWorkshops, getReviewsByTarget } from '../../services/getAllData'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Helper component for coloring percentages


export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nonAdminUserCount, setNonAdminUserCount] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMentors, setRecentMentors] = useState([]);
  const [recentWorkshops, setRecentWorkshops] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [topMentors, setTopMentors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await getAnalytics();
        setAnalytics(analyticsRes.data);
        // Fetch all users with a high limit (e.g., 1000)
        const usersRes = await getAllUsers(1, 1000);
        const users = usersRes.users || [];
        const nonAdmins = users.filter(user => user.role !== "admin");
        setNonAdminUserCount(nonAdmins.length);
      } catch {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        // In the fetchRecent useEffect, filter users to only include students
        const usersRes = await getAllUsers(1, 20);
        setRecentUsers(
          (usersRes.users || [])
            .filter(u => u.role === 'student')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
        const mentorsRes = await getAllMentors();
        setRecentMentors((mentorsRes || []).slice(-5).reverse());
        // Find the mentor with the highest rating
        if (mentorsRes && mentorsRes.length > 0) {
          const sorted = [...mentorsRes].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopMentors(sorted.slice(0, 3));
          const reviews = await getReviewsByTarget('mentor', mentorsRes[0]._id);
          setRecentReviews((reviews || []).slice(-5).reverse());
        }
        const workshopsRes = await getAllWorkshops();
        setRecentWorkshops((workshopsRes.data || workshopsRes || []).slice(-5).reverse());
      } catch {
        // Optionally log or handle error
      }
    };
    fetchRecent();
  }, []);


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 bg-background">
        <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
        <Sidebar />
        </div>
        <div className="flex-1 ml-80 p-6 shadow-lg rounded-lg">
        {/* <main className="flex-1 p-6"> */}
          {/* <div className="bg-surface shadow-lg rounded-lg p-8 m-4 transition-theme"> */}
            <h2 className="text-3xl font-bold text-primary mb-8 mt-8 tracking-wide">Overview</h2>
            {loading ? (
              <div>Loading analytics...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 mb-10">
                  <div className="card bg-green-100 p-6 rounded-lg">
                  <p className="text-base font-medium text-secondary mb-2">User Signups</p>
                    <p className="text-3xl font-bold text-green-700 mb-1">{nonAdminUserCount !== null ? nonAdminUserCount : analytics.totalUsers}</p>
                </div>
                  <div className="card bg-green-100 p-6 rounded-lg">
                  <p className="text-base font-medium text-secondary mb-2">Students</p>
                    <p className="text-3xl font-bold text-green-700 mb-1">{analytics.totalStudents}</p>
                </div>
                  <div className="card bg-green-100 p-6 rounded-lg">
                  <p className="text-base font-medium text-secondary mb-2">Mentors</p>
                    <p className="text-3xl font-bold text-green-700 mb-1">{analytics.totalMentors}</p>
                </div>
                  <div className="card bg-green-100 p-6 rounded-lg">
                  <p className="text-base font-medium text-secondary mb-2">Workshops</p>
                    <p className="text-3xl font-bold text-green-700 mb-1">{analytics.totalWorkshops}</p>
                  </div>
                  <div className="card bg-green-100 p-6 rounded-lg">
                    <p className="text-base font-medium text-secondary mb-2">Reviews</p>
                    <p className="text-3xl font-bold text-green-700 mb-1">{analytics.totalReviews}</p>
                  </div>
                </div>
              )}
              {/* Top Rated Mentors and Analytics Bar Chart Side by Side */}
              {(topMentors.length > 0 || analytics) && (
                <div className="flex flex-col lg:flex-row flex-wrap gap-8 mb-8">
                  {analytics && (
                  <div className=" bg-white rounded-3xl shadow-xl p-4 flex-1 flex-shrink-0 flex flex-col min-w-[200px] max-w-full min-h-[320px]">
                    <h3 className="text-lg font-bold text-primary mb-2 text-center">Platform Analytics Overview</h3>
                    <div className="flex-1 w-full h-full">
                      <Bar
                        data={{
                          labels: ['Users', 'Students', 'Mentors', 'Workshops', 'Reviews'],
                          datasets: [
                            {
                              label: 'Count',
                              data: [
                                nonAdminUserCount !== null ? nonAdminUserCount : analytics.totalUsers,
                                analytics.totalStudents,
                                analytics.totalMentors,
                                analytics.totalWorkshops,
                                analytics.totalReviews,
                              ],
                              backgroundColor: [
                                'rgba(34,197,94,0.7)',
                                'rgba(59,130,246,0.7)',
                                'rgba(234,179,8,0.7)',
                                'rgba(139,92,246,0.7)',
                                'rgba(251,191,36,0.7)',
                              ],
                              borderRadius: 8,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            title: { display: false },
                          },
                          scales: {
                            x: {
                              ticks: {
                                font: { size: 12 },
                                color: '#166534',
                                angle: 0,
                                minRotation: 0,
                              },
                              grid: { display: false },
                              barPercentage: 0.5,
                              categoryPercentage: 0.5,
                            },
                            y: {
                              ticks: {
                                font: { size: 12 },
                                color: '#166534',
                              },
                              grid: { color: '#e0f2e9' },
                            },
                          },
                          layout: {
                            padding: { top: 8, bottom: 8, left: 8, right: 8 },
                          },
                          elements: {
                            bar: {
                              borderWidth: 1,
                              borderSkipped: false,
                            },
                          },
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                )}
                  {topMentors.length > 0 && (
                    <div className="card  bg-white p-8 flex-1 flex-shrink-0 min-w-[200px] max-w-full rounded-3xl">
                      <p className="text-xl font-bold text-primary mb-6 border-b border-green-200 pb-2 text-center">Top Rated Mentors</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                      {topMentors.map((mentor, idx) => (
                        <div
                          key={mentor._id}
                          className={`relative min-w-[120px] max-w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border
                            ${idx === 0 ? 'border-yellow-400' : 'border-green-100'}
                            ${topMentors.length === 3 && idx === 2 ? 'md:col-span-2 md:mx-auto md:w-1/2' : ''}`}
                        >
                          {idx === 0 && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 rounded-full border-2 px-4 py-1 font-bold text-xs shadow bg-yellow-400 text-yellow-900 border-yellow-300" style={{ minWidth: 48, textAlign: "center" }}>
                              Top
                            </span>
                          )}
                          <img
                            src={mentor.image || "https://via.placeholder.com/64x64?text=M"}
                            alt={mentor.name}
                            className="w-16 h-16 rounded-full border-4 border-green-200 mb-2 mt-4 shadow"
                          />
                          <p className="font-semibold text-primary text-center">{mentor.name}</p>
                          <p className="text-xs text-secondary text-center mb-1">{mentor.title || (mentor.expertise && mentor.expertise[0])}</p>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="font-bold text-amber-500">{mentor.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  
              </div>
            )}

              {/* Recent Activity Section */}
            <h2 className="text-2xl font-semibold text-primary mt-8 mb-6">Recent Activity</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card p-6 bg-white rounded-xl shadow-md border border-blue-100">
                <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0121 19.5c0 .828-.895 1.5-2 1.5H5c-1.105 0-2-.672-2-1.5a12.083 12.083 0 012.84-8.922L12 14z" /></svg>
                  New Students
                </h3>
                <ul>
                  {recentUsers.map(user => (
                    <li key={user._id} className="mb-2 flex items-center gap-2 hover:bg-blue-50 rounded px-2 py-1 transition">
                      <img src={user.image || 'https://via.placeholder.com/32x32?text=U'} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                      <span className="font-medium text-primary">{user.name}</span>
                      <span className="text-xs text-gray-500">({user.email})</span>
                      <span className="ml-auto text-xs text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</span>
                    </li>
                  ))}
                </ul>
                  </div>
              <div className="card p-6 bg-white rounded-xl shadow-md border border-green-100">
                <h3 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm0 0c0 1.104.896 2 2 2s2-.896 2-2-.896-2-2-2-2 .896-2 2zm-6 8v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></svg>
                  New Mentors
                </h3>
                <ul>
                  {recentMentors.map(mentor => (
                    <li key={mentor._id} className="mb-2 flex items-center gap-2 hover:bg-green-50 rounded px-2 py-1 transition">
                      <img src={mentor.image || 'https://via.placeholder.com/32x32?text=M'} alt={mentor.name} className="w-8 h-8 rounded-full border border-gray-200" />
                      <span className="font-medium text-primary">{mentor.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : ''}</span>
                    </li>
                  ))}
                </ul>
                  </div>
              <div className="card p-6 bg-white rounded-xl shadow-md border border-purple-100">
                <h3 className="text-lg font-bold mb-4 text-purple-700 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 003 3 3 3 0 003-3v-1c0-1.657-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2z" /></svg>
                  New Workshops
                </h3>
                <ul>
                  {recentWorkshops.map(ws => (
                    <li key={ws._id} className="mb-2 flex items-center gap-2 hover:bg-purple-50 rounded px-2 py-1 transition">
                      <span className="font-medium text-primary">{ws.title}</span>
                      <span className="ml-auto text-xs text-gray-400">{ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6 bg-white rounded-xl shadow-md border border-yellow-100">
                <h3 className="text-lg font-bold mb-4 text-yellow-700 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.365-2.446a1 1 0 00-1.176 0l-3.365 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.35 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" /></svg>
                  Recent Reviews
                </h3>
                <ul>
                  {recentReviews.map(rv => (
                    <li key={rv._id} className="mb-2 flex items-center gap-2 hover:bg-yellow-50 rounded px-2 py-1 transition">
                      <span className="font-medium text-primary">{rv.author?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-500">{rv.comment?.slice(0, 40) || ''}</span>
                      <span className="ml-auto text-xs text-gray-400">{rv.createdAt ? new Date(rv.createdAt).toLocaleDateString() : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          {/* </div> */}
        {/* </main> */}
        </div>
      </div>
    </div>
  )
}
