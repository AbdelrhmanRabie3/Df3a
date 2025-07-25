import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Admin/Sidebar";
import Navbar from "../../components/Admin/Navbar";
import { getAllWorkshops } from "../../services/getAllData";

export default function AdminWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchWorkshops = async () => {
      setLoading(true);
      try {
        const response = await getAllWorkshops();
        console.log("Fetched workshops data:", response);
        setWorkshops(response.data);
      } catch {
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  // Reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Calculate analytics from workshops data
  const totalWorkshops = workshops.length;
  const averageAttendance = totalWorkshops > 0 ? Math.round(
    workshops.reduce((sum, ws) => sum + (ws.registeredStudents?.length || 0), 0) / totalWorkshops / (workshops[0]?.capacity || 1) * 100
  ) : 0;

  // Filter workshops by title or type
  const filteredWorkshops = workshops.filter(ws =>
    (ws.title && ws.title.toLowerCase().includes(search.toLowerCase())) ||
    (ws.type && ws.type.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedWorkshops = filteredWorkshops.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredWorkshops.length / limit);

  return (
    <>
      <Navbar />
      <div>
        <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
        <Sidebar />
        </div>
        <div className="ml-80 min-h-screen bg-background">
          <main className="p-8">
          <div className="bg-surface shadow-lg rounded-lg p-8 transition-theme">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-primary">Workshops Management</h1>
              
            </header>
            <div className="border-default border-b mb-6">
              
            </div>
            {/* Section Title */}
            <h2 className="text-3xl font-bold text-green-800 text-center mb-8 mt-8 tracking-wide">
              Analytics
            </h2>
            {/* Analytics Cards */}
            <div className="flex justify-center items-center mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card flex flex-col items-center justify-center p-8 min-w-[260px] min-h-[180px] text-lg bg-gradient-to-br from-blue-100 to-blue-50 shadow">
                  <svg className="w-8 h-8 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                    </svg>
                  <p className="text-base text-secondary text-center">Total Workshops</p>
                  <p className="text-4xl font-bold text-primary mt-2 text-center">{totalWorkshops}</p>
                </div>
                <div className="card flex flex-col items-center justify-center p-8 min-w-[260px] min-h-[180px] text-lg bg-gradient-to-br from-green-100 to-green-50 shadow">
                  <svg className="w-8 h-8 text-green-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" />
                  </svg>
                  <p className="text-base text-secondary text-center">Average Attendance</p>
                  <p className="text-4xl font-bold text-primary mt-2 text-center">{averageAttendance}%</p>
                </div>
              </div>
            </div>
            {/* Search Input */}
            <div className="mb-6 flex justify-start">
              <div className="relative w-full max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="input-field pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                  placeholder="Search by title or type..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
                <table className="w-full text-left">
                  <thead>
                  <tr className="border-b bg-blue-50">
                    <th className="p-4 text-base text-secondary font-semibold">Title</th>
                    <th className="p-4 text-base text-secondary font-semibold">Type</th>
                    <th className="p-4 text-base text-secondary font-semibold">Date</th>
                    <th className="p-4 text-base text-secondary font-semibold">Time</th>
                    <th className="p-4 text-base text-secondary font-semibold">Location</th>
                    <th className="p-4 text-base text-secondary font-semibold">Language</th>
                    <th className="p-4 text-base text-secondary font-semibold">Mentor</th>
                    <th className="p-4 text-base text-secondary font-semibold">Registered</th>
                    <th className="p-4 text-base text-secondary font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-6 text-primary">Loading workshops...</td>
                    </tr>
                  ) : paginatedWorkshops.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-6 text-secondary">No workshops found.</td>
                    </tr>
                  ) : (
                    paginatedWorkshops.map((ws) => (
                      <tr
                        key={ws._id}
                        className="border-b hover:bg-blue-50 transition"
                      >
                        <td className="p-4 text-base text-link font-medium">{ws.title}</td>
                        <td className="p-4 text-base text-secondary">{ws.type}</td>
                        <td className="p-4 text-base text-secondary">{ws.date ? new Date(ws.date).toLocaleDateString() : ''}</td>
                        <td className="p-4 text-base text-secondary">{ws.time}</td>
                        <td className="p-4 text-base text-secondary">{ws.location}</td>
                        <td className="p-4 text-base text-secondary">{ws.language}</td>
                        <td className="p-4 text-base text-secondary">{ws.mentor?.name || 'N/A'}</td>
                        <td className="p-4 text-base text-secondary">{(ws.registeredStudents?.length || 0) + '/' + (ws.capacity || 0)}</td>
                      <td className="p-4">
                          <span className={`px-3 py-1 text-sm rounded-full ${ws.date && new Date(ws.date) < new Date() ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-link'}`}>
                            {ws.date && new Date(ws.date) < new Date() ? 'Completed' : 'Upcoming'}
                        </span>
                      </td>
                    </tr>
                    ))
                  )}
                  </tbody>
                </table>
            </div>
            {totalPages > 0 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  className="px-4 py-2 rounded bg-accent text-white disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-primary">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  className="px-4 py-2 rounded bg-accent text-white disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
