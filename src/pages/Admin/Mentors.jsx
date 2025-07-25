
import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Admin/Sidebar'
import Navbar from '../../components/Admin/Navbar'
import { getAllMentors } from '../../services/getAllData'
import { verfiyMentor, getMentorById } from '../../services/adminServices';
import { Link } from 'react-router';


export default function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState('directory');
  const [verifyingId, setVerifyingId] = useState(null); // For button loading state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filteredExpertise, setFilteredExpertise] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const response = await getAllMentors();
        console.log("API response:", response);
        setMentors(response || []);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  // Reset page on search or tab change
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  console.log(mentors)

  // Extract all unique expertise values
  const allExpertise = Array.from(
    new Set(mentors.flatMap(m => m.expertise || []))
  );

  const filteredMentors = mentors.filter(mentor =>
    (mentor.name.toLowerCase().includes(search.toLowerCase()) ||
     mentor.email.toLowerCase().includes(search.toLowerCase())) &&
    (filteredExpertise ? mentor.expertise?.includes(filteredExpertise) : true)
  );

  let displayedMentors = filteredMentors;
  if (activeTab === 'applications') {
    displayedMentors = filteredMentors.filter(mentor => !mentor.verified);
  } else if (activeTab === 'onboarding') {
    displayedMentors = filteredMentors.filter(mentor => mentor.verified);
  }

  const paginatedMentors = displayedMentors.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(displayedMentors.length / limit);

  const handleVerifyMentor = async (mentorId) => {
    setVerifyingId(mentorId);
    try {
      await verfiyMentor(mentorId);
      setMentors(prev =>
        prev.map(m => m._id === mentorId ? { ...m, verified: true } : m)
      );
    } catch {
      alert('Failed to verify mentor');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleViewMentorDetails = async (mentorId) => {
    setMentorLoading(true);
    setMentorModalOpen(true);
    try {
      const mentor = await getMentorById(mentorId);
      setSelectedMentor(mentor);
    } catch {
      setSelectedMentor(null);
    } finally {
      setMentorLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
          <Sidebar />
        </div>
        <div className="ml-80 min-h-screen bg-background">
          <div className="min-w-0 flex flex-col p-6">
            <header className="border-default border-b bg-surface px-8 py-6 rounded-t-lg shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">Mentors</h1>
              </div>
            </header>
            <main className="flex-1">
              <div className="bg-surface shadow-lg rounded-lg p-8 transition-theme">
                <div className="flex border-default border-b mb-6">
                  <a
                    className={`border-b-2 px-4 py-3 text-sm font-bold cursor-pointer ${activeTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:border-hover hover:text-primary'}`}
                    onClick={() => setActiveTab('directory')}
                  >
                    Directory
                  </a>
                  <a
                    className={`border-b-2 px-4 py-3 text-sm font-bold cursor-pointer ${activeTab === 'applications' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:border-hover hover:text-primary'}`}
                    onClick={() => setActiveTab('applications')}
                  >
                    Applications
                  </a>
                  <a
                    className={`border-b-2 px-4 py-3 text-sm font-bold cursor-pointer ${activeTab === 'onboarding' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:border-hover hover:text-primary'}`}
                    onClick={() => setActiveTab('onboarding')}
                  >
                    Onboarding
                  </a>
                </div>
                {/* Expertise Filter Dropdown - moved below tab filter */}
                <div className="mb-6 flex items-center gap-4">
                  <label htmlFor="expertise-filter" className=" bg-green-800 px-4 py-2 rounded-full text-sm font-medium text-white">Filter by Expertise:</label>
                  <select
                    id="expertise-filter"
                    className="input-field px-4 py-2 rounded border"
                    value={filteredExpertise}
                    onChange={e => setFilteredExpertise(e.target.value)}
                  >
                    <option value="">All Expertise</option>
                    {allExpertise.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                  <div className="card p-6 mt-4">
                  <div className="mb-4">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5 text-secondary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            fillRule="evenodd"
                          ></path>
                        </svg>
                      </div>

                      <input className="input-field w-full pl-10" placeholder="Search mentors" type="text" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="text-center text-accent mb-4">Loading mentors...</div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-surface">
                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-black">Name</th>
                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-black">Verified</th>
                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-black">Expertise</th>
                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-black">Rating</th>
                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-black">Registered</th>
                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-black">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-default bg-surface">
                          {paginatedMentors.map(mentor => (
                            <tr key={mentor._id}>
                              {/* Name */}
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <img
                                      alt={mentor.name}
                                      className="h-10 w-10 rounded-full"
                                      src={mentor.image || "https://via.placeholder.com/40x40?text=No+Image"}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-primary">
                                      {mentor.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {/* Verified */}
                              <td className="whitespace-nowrap px-6 py-4 text-sm">
                                {mentor.verified ? (
                                  <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">Verified</span>
                                ) : (
                                  <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">Not Verified</span>
                                )}
                              </td>
                              {/* Expertise */}
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary">
                                {mentor.expertise && mentor.expertise.length > 0
                                  ? mentor.expertise.slice(0, 2).join(", ")
                                  : "No expertise listed"}
                              </td>
                              {/* Rating */}
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary">
                                <span className="flex items-center gap-1">
                                  {mentor.rating && mentor.rating > 0 ? (
                                    <>
                                      {mentor.rating}
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="#FFA500" viewBox="0 0 24 24" stroke="#FFA500" strokeWidth={1.5} className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                      </svg>
                                    </>
                                  ) : (
                                    'N/A'
                                  )}
                                </span>
                              </td>
                              {/* Registered */}
                              <td className={`whitespace-nowrap px-6 py-4 text-sm`}>
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${mentor.isRegistered ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {mentor.isRegistered ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              {/* Actions */}
                              <td className="whitespace-nowrap px-6 py-4 flex gap-2 justify-center items-center">
                                   <button
                                     className="px-2 py-1 btn-primary text-white rounded text-xs hover:bg-green-700 transition"
                                     onClick={() => handleViewMentorDetails(mentor._id)}
                                   >
                                     View Details
                                   </button>
                                   {!mentor.verified && (
                                     <button
                                       className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                                       onClick={() => handleVerifyMentor(mentor._id)}
                                       disabled={verifyingId === mentor._id}
                                     >
                                       {verifyingId === mentor._id ? 'Verifying...' : 'Verify'}
                                     </button>
                                   )}
                                </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                  </div>
                  {/* Pagination Controls */}
                  {totalPages > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <button
                        className="px-4 py-2 rounded bg-accent text-white disabled:opacity-50"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                      <span className="text-primary">
                        Page {page} of {totalPages || 1}
                      </span>
                      <button
                        className="px-4 py-2 rounded bg-accent text-white disabled:opacity-50"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      {/* Mentor Details Modal */}
      {mentorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-700 p-8 max-w-lg w-full relative flex flex-col items-center animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-3xl font-bold focus:outline-none"
              onClick={() => setMentorModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {mentorLoading ? (
              <div className="text-center py-12 text-lg text-primary">Loading...</div>
            ) : selectedMentor ? (
              <div className="w-full flex flex-col items-center">
                <img
                  src={selectedMentor.image || 'https://via.placeholder.com/80x80?text=M'}
                  alt={selectedMentor.name}
                  className="w-20 h-20 rounded-full border-4 border-green-200 mb-4 shadow"
                />
                <h2 className="text-2xl font-bold mb-1 text-primary text-center">{selectedMentor.name}</h2>
                <p className="mb-2 text-green-700 font-medium text-center">{selectedMentor.title}</p>
                <div className="w-full flex flex-col gap-2 mt-2">
                  <div><span className="font-semibold text-primary">Email:</span> <span className="text-secondary">{selectedMentor.email}</span></div>
                  <div><span className="font-semibold text-primary">Expertise:</span> <span className="text-secondary">{(selectedMentor.expertise || []).join(', ')}</span></div>
                  <div><span className="font-semibold text-primary">Rating:</span> <span className="text-yellow-600">{selectedMentor.rating || 'N/A'}</span></div>
                  <div><span className="font-semibold text-primary">Bio:</span> <span className="text-secondary">{selectedMentor.bio || 'N/A'}</span></div>
                  <div><span className="font-semibold text-primary">Phone:</span> <span className="text-secondary">{selectedMentor.phoneNumber || 'N/A'}</span></div>
                  <div><span className="font-semibold text-primary">Languages:</span> <span className="text-secondary">{(selectedMentor.languages || []).join(', ') || 'N/A'}</span></div>
                  <div><span className="font-semibold text-primary">Experience:</span> <span className="text-secondary">{selectedMentor.experience || 'N/A'}</span></div>
                  {selectedMentor.socialLinks && selectedMentor.socialLinks.length > 0 && (
                    <div>
                      <span className="font-semibold text-primary">Social Links:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedMentor.socialLinks.map(link => (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-xs"
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-600">Mentor not found.</div>
            )}
          </div>
        </div>
      )}
      </>
    )
  }

