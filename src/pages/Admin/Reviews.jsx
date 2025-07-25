import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Admin/Sidebar'
import Navbar from '../../components/Admin/Navbar'
import { getAllMentors, getReviewsByTarget } from '../../services/getAllData'
import { deleteReview } from '../../services/adminServices'

export default function Reviews() {
  // Removed unused setTargetType state
  const [targetId, setTargetId] = useState('');
  const [mentors, setMentors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mentorSearch, setMentorSearch] = useState('');
  const [showMentorList, setShowMentorList] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews(reviews => reviews.filter(r => r._id !== reviewId));
    } catch {
      alert('Failed to delete review.');
    }
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  // Fetch mentors for dropdown
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllMentors();
      setMentors(data || []);
    };
    fetchData();
  }, []);

  // Fetch reviews when targetType or targetId changes
  useEffect(() => {
    if (!targetId) {
      setReviews([]);
      return;
    }
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const reviews = await getReviewsByTarget('mentor', targetId); // Assuming targetType is 'mentor' for now
        setReviews(reviews || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [targetId]);

  // Calculate dynamic overall rating and rating distribution
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    n => reviews.filter(r => Math.round(r.rating) === n).length
  );
  const ratingPercents = ratingCounts.map(count =>
    totalReviews ? (count / totalReviews) * 100 : 0
  );

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
              <div className="text-2xl font-bold text-primary mb-8">Reviews Management</div>
              {/* Dropdowns */}
              <div className="flex gap-4 mb-6">
                <span className="bg-green-800 text-white rounded-full px-4 py-3 text-sm font-medium">Mentor</span>
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    className="input-field px-4 py-2 rounded-full border-2 border-green-700 bg-green-50 text-primary w-full"
                    placeholder="Search mentor by name..."
                    value={mentorSearch}
                    onChange={e => {
                      setMentorSearch(e.target.value);
                      setShowMentorList(true);
                      if (e.target.value === '') {
                        setTargetId('');
                      }
                    }}
                    onFocus={() => setShowMentorList(true)}
                  />
                  {showMentorList && mentorSearch && (
                    <ul className="absolute z-10 bg-white border border-green-200 rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow">
                      {mentors
                        .filter(m => m.name.toLowerCase().includes(mentorSearch.toLowerCase()))
                        .map(m => (
                          <li
                            key={m._id}
                            className="px-4 py-2 cursor-pointer hover:bg-green-100"
                            onClick={() => {
                              setTargetId(m._id);
                              setMentorSearch(m.name);
                              setShowMentorList(false);
                            }}
                          >
                            {m.name}
                          </li>
                        ))}
                      {mentors.filter(m => m.name.toLowerCase().includes(mentorSearch.toLowerCase())).length === 0 && (
                        <li className="px-4 py-2 text-gray-400">No mentors found</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="card col-span-1 md:col-span-3 p-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">Overall Rating</h2>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <p className="text-6xl font-bold text-primary">{averageRating}</p>
                      <div className="flex text-accent">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-6 h-6"
                            fill={i < Math.round(averageRating) ? "#FFD700" : "#E5E7EB"}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.365-2.446a1 1 0 00-1.176 0l-3.365 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.35 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {/* Dynamic rating bars */}
                      {[5, 4, 3, 2, 1].map((n, idx) => (
                        <div className="flex items-center gap-4" key={n}>
                          <span className="text-sm text-secondary">{n}</span>
                        <div className="w-full bg-surface rounded-full h-2.5">
                            <div className="bg-accent h-2.5 rounded-full" style={{width: `${ratingPercents[idx]}%`}}></div>
                        </div>
                          <span className="text-sm text-secondary">{Math.round(ratingPercents[idx])}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Recent Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="text-center text-accent mb-4">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center text-secondary mb-4">No reviews found.</div>
                  ) : (
                    reviews.map((review, idx) => (
                      <div
                        key={review._id || idx}
                        className="bg-green-100 rounded-xl shadow-md p-6 flex flex-col border border-green-300 h-full"
                      >
                        {/* Reviewer Info */}
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={review.author?.image || 'https://via.placeholder.com/48x48?text=User'}
                            alt={review.author?.name || 'User avatar'}
                            className="w-12 h-12 rounded-full border border-gray-200"
                          />
                          <div>
                            <div className="font-semibold text-primary">{review.author?.name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">{review.author?.email}</div>
                          </div>
                          <div className="ml-auto text-xs text-gray-400">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                        {/* Target Info */}
                        <div className="flex items-center gap-2 text-xs text-green-700 font-medium mb-1">
                          <span className="bg-green-800 text-white px-4 py-1 rounded-full">
                            {review.targetType === 'mentor' ? 'Mentor' : 'Workshop'}
                          </span>
                          <span className="text-gray-700">
                            {review.targetType === 'workshop' ? (review.targetTitle || review.targetName || '') : (review.targetName || '')}
                          </span>
                        </div>
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-5 h-5"
                              fill={i < (review.rating || 0) ? '#FFD700' : '#E5E7EB'}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.365-2.446a1 1 0 00-1.176 0l-3.365 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.35 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-500">{review.rating || 'No rating'}</span>
                        </div>
                        {/* Comment */}
                        <div className="text-gray-800 text-base mb-2 flex-1">{review.comment || ''}</div>
                        <button
                          className="mt-auto self-end bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                          onClick={() => {
                            setReviewToDelete(review);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
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
            <h2 className="text-lg font-bold text-primary mb-4">Delete Review</h2>
            <p className="mb-6 text-center text-secondary">
              Are you sure you want to delete this review by <span className="font-semibold text-primary">{reviewToDelete?.author?.name || 'this user'}</span>?
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
                  await handleDeleteReview(reviewToDelete._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

