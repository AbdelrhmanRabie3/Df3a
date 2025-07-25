import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Admin/Sidebar";
import Navbar from "../../components/Admin/Navbar";
import {
  getAllReports,
  markReportResolved,
} from "../../services/reportService";

const TABS = [
  { key: "all", label: "All Reports" },
  { key: "unresolved", label: "Unresolved" },
  { key: "resolved", label: "Resolved" },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState({}); // { [reportId]: true/false }
  const [activeTab, setActiveTab] = useState("all");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [targetType, setTargetType] = useState("all"); // 'all', 'workshop', 'booking'
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getAllReports();
        setReports(response.reports || response.data || []);
      } catch (err) {
        setError("Failed to fetch reports.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleResolve = async (reportId) => {
    setResolving((prev) => ({ ...prev, [reportId]: true }));
    try {
      await markReportResolved(reportId);
      setReports((reports) =>
        reports.map((r) =>
          r._id === reportId ? { ...r, status: "resolved" } : r
        )
      );
    } catch {
      alert("Failed to resolve report.");
    } finally {
      setResolving((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  let filteredReports = reports;
  if (activeTab === "unresolved") {
    filteredReports = reports.filter((r) => r.status !== "resolved");
  } else if (activeTab === "resolved") {
    filteredReports = reports.filter((r) => r.status === "resolved");
  }
  // Filter by target type
  if (targetType === "workshop") {
    filteredReports = filteredReports.filter((r) => r.workshop);
  } else if (targetType === "booking") {
    filteredReports = filteredReports.filter((r) => r.booking);
  }
  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <>
      <Navbar />
      <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 z-30">
        <Sidebar />
      </div>
      <div className="ml-80 min-h-screen bg-background">
        <main className="p-8">
            <div className="bg-surface shadow-lg rounded-lg p-4 w-full transition-theme">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-primary">Reports</h1>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                      activeTab === tab.key
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-primary hover:bg-primary/10"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Filter and Pagination Controls */}
              <div className="flex flex-wrap gap-4 mb-4 items-center">
                <div>
                  <label className="mr-2 font-medium">Show:</label>
                  <select
                    className="border rounded px-2 py-1"
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">All</option>
                    <option value="workshop">Workshop Reports</option>
                    <option value="booking">Booking Reports</option>
                  </select>
                </div>
              </div>
              <div className="card overflow-x-auto p-2 w-full">
                {loading ? (
                  <div className="text-center text-accent mb-4">
                    Loading reports...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 mb-4">{error}</div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center text-secondary mb-4">
                    No reports found.
                  </div>
                ) : (
                  <table className="w-full min-w-0 text-left text-sm">
                    <thead>
                      <tr className="border-default border-b">
                        <th className="p-3 font-semibold text-primary">
                          Reporter
                        </th>
                        <th className="p-3 font-semibold text-primary">
                          Reported User
                        </th>
                        <th className="p-3 font-semibold text-primary">
                          Target
                        </th>
                        <th className="p-3 font-semibold text-primary">
                          Reason
                        </th>
                        <th className="p-3 font-semibold text-primary">
                          Message
                        </th>
                        <th className="p-3 font-semibold text-primary">
                          Status
                        </th>
                        <th className="p-3 font-semibold text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedReports.map((report) => (
                        <tr key={report._id}>
                          <td className="whitespace-nowrap px-3 py-3 max-w-xs truncate text-sm">
                            <div>
                              {report.reporter?.name || report.reporter || "-"}
                            </div>
                            {report.reporter?.role && (
                              <div className="text-xs text-secondary">
                                {report.reporter.role}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 max-w-xs truncate text-sm">
                            <div>
                              {report.reportedUser?.name ||
                                report.reportedUser ||
                                "-"}
                            </div>
                            {report.reportedUser?.role && (
                              <div className="text-xs text-secondary">
                                {report.reportedUser.role}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 max-w-xs break-words text-sm">
                            {report.workshop ? (
                              <>
                                <div className="font-semibold">Workshop:</div>
                                <div>
                                  Title:{" "}
                                  {report.workshop.title || report.workshop._id}
                                </div>
                                {report.workshop.date && (
                                  <div>
                                    Date:{" "}
                                    {new Date(
                                      report.workshop.date
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </>
                            ) : null}
                            {report.booking ? (
                              <>
                                <div className="font-semibold mt-2">Booking:</div>
                                <div>
                                  ID: {report.booking._id || report.booking}
                                </div>
                                {report.booking.date && (
                                  <div>Date: {report.booking.date}</div>
                                )}
                              </>
                            ) : null}
                            {!report.workshop && !report.booking && "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 max-w-xs truncate text-sm">
                            {report.reason}
                          </td>
                          <td className="px-3 py-3 max-w-xs text-sm">
                            <button
                              className="btn-secondary px-3 py-1 rounded"
                              onClick={() => {
                                setSelectedMessage(report.message);
                                setMessageModalOpen(true);
                              }}
                            >
                              View Message
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm">
                            {report.status === "resolved" ? (
                              <span className="text-green-700 font-semibold">
                                Resolved
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm">
                            {report.status !== "resolved" && (
                              <button
                                className="btn-primary px-2 py-1 rounded text-xs"
                                onClick={() => handleResolve(report._id)}
                                disabled={resolving[report._id]}
                              >
                                {resolving[report._id]
                                  ? "Resolving..."
                                  : "Mark as Resolved"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
      {messageModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Report Message</h2>
            <div className="bg-gray-50 rounded p-4 break-words whitespace-pre-line text-secondary shadow-inner border border-default mb-4">
              {selectedMessage}
            </div>
            <div className="flex justify-end">
              <button
                className="btn-primary px-4 py-2 rounded"
                onClick={() => setMessageModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
