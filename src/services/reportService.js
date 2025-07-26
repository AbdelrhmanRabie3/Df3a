import axios from "axios";
import Cookies from "js-cookie";
const URL = "http://localhost:5000";

const getToken = () => Cookies.get("token");

// Create a new report (by student or mentor)
export async function createReport(reportData) {
  try {
    const token = getToken();
    console.log("Sending report payload:", reportData);
    const response = await axios.post(`${URL}/api/reports`, reportData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    if (error.response) {
      console.error("Backend error:", error.response.data);
    }
    throw error;
  }
}

// Admin: Get all reports
export async function getAllReports() {
  try {
    const token = getToken();
    const response = await axios.get(`${URL}/api/reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

// Admin: Mark a report as resolved
export async function markReportResolved(reportId) {
  try {
    const token = getToken();
    const response = await axios.patch(
      `${URL}/api/reports/${reportId}/resolve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error resolving report:", error);
    throw error;
  }
}

// Check if a user has already reported a booking or workshop
export async function hasUserReported({
  reporter,
  reportedUser,
  booking,
  workshop,
}) {
  const params = new URLSearchParams();
  if (reporter) params.append("reporter", reporter);
  if (reportedUser) params.append("reportedUser", reportedUser);
  if (booking) params.append("booking", booking);
  if (workshop) params.append("workshop", workshop);

  const token = getToken();
  const response = await axios.get(
    `${URL}/api/reports/reportsforuser?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.reports.length > 0;
}
