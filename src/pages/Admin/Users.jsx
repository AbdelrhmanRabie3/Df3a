import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Admin/Sidebar'
import Navbar from '../../components/Admin/Navbar'
import { getAllUsers } from '../../services/getAllData'
import { deleteUser, suspendUser, unsuspendUser } from '../../services/adminServices';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // You can make this adjustable if you want
  const [filteredRole, setFilteredRole] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers(1, 1000); // Fetch all users at once
        setUsers(response.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filteredRole, search]);
  console.log(users);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users => users.filter(u => u._id !== userId));
    } catch {
      alert('Failed to delete user.');
    }
  };
  
  const handleToggleSuspend = async (userId, currentlySuspended) => {
    try {
      if (currentlySuspended) {
        await unsuspendUser(userId);
      } else {
        await suspendUser(userId);
      }
      setUsers(users =>
        users.map(u =>
          u._id === userId ? { ...u, suspended: !currentlySuspended } : u
        )
      );
    } catch {
      alert('Failed to update suspension status.');
    }
  };

  // Filter the full users list before paginating
  const allFilteredUsers = users
    .filter(user => user.role !== "admin")
    .filter(user =>
      (filteredRole ? user.role === filteredRole : true) &&
      (
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
      )
    );

  // Paginate the filtered list
  const paginatedUsers = allFilteredUsers.slice((page - 1) * limit, page * limit);

  // Use backend totalPages if available
  const totalPages = allFilteredUsers.length === 0 ? 1 : Math.ceil(allFilteredUsers.length / limit);
  // Or simply:
  // const totalPages = response.pagination?.totalPages || Math.ceil(total / limit) || 1;

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
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <h1 className="text-2xl font-bold text-primary">Users</h1>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <label htmlFor="role-filter" className="text-sm font-medium text-white bg-green-800 px-2 py-1 rounded-3xl">Filter by Role:</label>
              <select
                id="role-filter"
                className="input-field px-4 py-2 rounded border"
                value={filteredRole}
                onChange={e => setFilteredRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                {/* Add more roles if needed */}
              </select>
            </div>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-accent">
                  <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
                <input className="input-field w-full pl-10 rounded-full border-2 border-accent bg-surface shadow focus:border-primary-brand focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-secondary" placeholder="Search users..." type="search" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="card overflow-x-auto p-6">
              {loading ? (
                <div className="text-center text-accent mb-4">Loading users...</div>
              ) : null}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-default border-b">
                    <th className="p-4 text-sm font-semibold text-primary">Name</th>
                    <th className="p-4 text-sm font-semibold text-primary">Email</th>
                    <th className="p-4 text-sm font-semibold text-primary">Role</th>
                    <th className="p-4 text-sm font-semibold text-primary">Phone Number</th>
                      <th className="p-4 text-sm font-semibold text-secondary text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                              src={user.image || "https://via.placeholder.com/40x40?text=No+Image"}
                            />
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium text-primary ${user.suspended ? 'line-through text-gray-400' : ''}`}> 
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 typography_body whitespace-nowrap ${user.suspended ? 'line-through text-gray-400' : ''}`}>{user.email}</td>
                    <td className="p-4 typography_body whitespace-nowrap">
                      <span
                           className={`px-2 py-1 text-xs font-semibold rounded-full
                             ${user.role === 'mentor' ? 'bg-blue-100 text-blue-800' : ''}
                             ${user.role === 'student' ? 'bg-orange-100 text-orange-800' : ''}
                           `}
                         >
                           {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                         </span>
                    </td>
                    <td className="p-4 typography_body whitespace-nowrap">
                         <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                           {user.phoneNumber}
                         </span>
                    </td>
                      <td className="whitespace-nowrap px-6 py-4 flex gap-2 justify-center items-center">
                        <button
                          className={`p-1 rounded hover:bg-gray-100 ${user.suspended ? 'opacity-60' : ''}`}
                          title={user.suspended ? 'Unsuspend' : 'Suspend'}
                          onClick={() => handleToggleSuspend(user._id, user.suspended)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${user.suspended ? 'text-red-600' : 'text-green-600'}` }>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-100"
                          title="Delete"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteModalOpen(true);
                          }}
                        >
                          {/* Delete icon (heroicon) */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  className="px-4 py-2 rounded bg-accent text-white disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
                <span className="text-primary">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  className="px-4 py-2 rounded bg-accent text-white disabled:opacity-50 cursor-pointer"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || loading || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full relative flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl font-bold"
              onClick={() => setDeleteModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold text-primary mb-4">Delete User</h2>
            <p className="mb-6 text-center text-secondary">
              Are you sure you want to delete <span className="font-semibold text-primary">{userToDelete?.name}</span>?
            </p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-primary hover:bg-gray-300"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  await handleDeleteUser(userToDelete._id);
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

