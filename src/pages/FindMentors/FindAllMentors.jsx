import MentorCard from "./MentorCard";
import { useContext, useEffect, useState } from "react";
import { getAllMentors } from "../../services/getAllData";
import Loading from "../../components/Loading/Loading";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { getRecommendedMentors } from "../../services/MentorsService";
import { IoSearch } from "react-icons/io5";
import { getArrayFromNumbers } from "../../utils/Numbers";
import { useQuery } from "@tanstack/react-query";

export const fetchMentorsData = async (user) => {
  const allMentors = await getAllMentors();

  if (user?.isRegistered && user?.role === "student") {
    const recommended = await getRecommendedMentors();
    const recommendedList = recommended.data.recommendedMentors;

    const remainingMentors = allMentors.filter(
      (mentor) => !recommendedList.find((r) => r._id === mentor._id)
    );

    return {
      recommended: recommendedList,
      mentors: remainingMentors,
    };
  }

  return {
    recommended: [],
    mentors: allMentors,
  };
};

function FindAllMentors() {
  const { user } = useContext(AuthContext);
  const [filteredExpertise, setFilteredExpertise] = useState("");
  const [filteredIndustry, setFilteredIndustry] = useState("");
  const [filteredPrice, setFilteredPrice] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRating, setFilteredRating] = useState("");
  useEffect(() => {
    setActivePage(1);
  }, [
    filteredExpertise,
    filteredIndustry,
    filteredPrice,
    searchQuery,
    filteredRating,
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mentors", user],
    queryFn: () => fetchMentorsData(user),
    enabled: !!user,
  });
  const mentors = data?.mentors || [];
  const recommendedMentors = data?.recommended || [];

  //Filters Select
  const allMentors = [...recommendedMentors, ...mentors];
  const MentorExpertise = new Set(
    allMentors.flatMap((mentor) => mentor.expertise)
  );
  const MentorsIndustries = new Set(
    allMentors
      .map((mentor) => mentor.title?.trim())
      .filter((title) => title)
      .map((title) => title.split(" ").slice(0, 2).join(" "))
  );

  const recommendedIds = recommendedMentors.map((m) => m._id);
  let filteredMentors = allMentors.filter((mentor) => {
    const expertiseMatch = filteredExpertise
      ? mentor.expertise.includes(filteredExpertise)
      : true;
    const industryMatch = filteredIndustry
      ? mentor.title?.includes(filteredIndustry)
      : true;
    const priceMatch = filteredPrice
      ? filteredPrice === "free"
        ? mentor.price === 0
        : mentor.price > 0
      : true;
    const searchMatch = searchQuery
      ? mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const ratingMatch = filteredRating
      ? Math.round(mentor.rating || 0) >= parseInt(filteredRating)
      : true;
    // Combine all conditions
    return (
      searchMatch &&
      expertiseMatch &&
      industryMatch &&
      priceMatch &&
      ratingMatch
    );
  });
  //Pagination
  const pageSize = 12;
  const noOfPages = Math.ceil(filteredMentors.length / pageSize);
  const pages = getArrayFromNumbers(noOfPages);
  const start = (activePage - 1) * pageSize;
  const end = start + pageSize;
  filteredMentors = filteredMentors.slice(start, end);
  if (isLoading) {
    return <Loading />;
  }
  return (
    <>
      <div className="relative">
        <input
          className="w-full pl-10 pr-4 py-4 rounded-full border-2 border-input focus:outline-none focus:border-primary transition-colors text-secondary bg-surface"
          placeholder="Search mentors by name"
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <IoSearch className="text-primary" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          className="border-2 text-primary bg-surface border-input rounded-full py-2 px-4"
          name="Expertise"
          id=""
          onChange={(e) => setFilteredExpertise(e.target.value)}
        >
          <option value="">Select Expertise</option>
          {Array(...MentorExpertise).map((skill) => {
            return (
              <option key={skill} value={skill}>
                {skill}
              </option>
            );
          })}
        </select>
        <select
          className="border-2 border-input text-primary bg-surface rounded-full py-2 px-4"
          name="Industry"
          id=""
          onChange={(e) => setFilteredIndustry(e.target.value)}
        >
          <option value="">Select Industry</option>
          {Array(...MentorsIndustries).map((industry) => {
            return (
              <option key={industry} value={industry}>
                {industry}
              </option>
            );
          })}
        </select>
        <select
          className="border-2  border-input text-primary bg-surface  rounded-full py-2 px-4"
          name="Price"
          id=""
          onChange={(e) => setFilteredPrice(e.target.value)}
        >
          <option className="" value="">
            Select Price
          </option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select
          className="border-2 text-primary bg-surface border-input rounded-full py-2 px-4"
          name="Rating"
          onChange={(e) => setFilteredRating(e.target.value)}
        >
          <option value="">Select Rating</option>
          <option value="5">⭐ 5 stars</option>
          <option value="4">⭐ 4 stars & up</option>
          <option value="3">⭐ 3 stars & up</option>
          <option value="2">⭐ 2 stars & up</option>
          <option value="1">⭐ 1 star & up</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredMentors?.map((mentor) => (
          <MentorCard
            key={mentor._id}
            mentor={mentor}
            isRecommended={recommendedIds.includes(mentor._id)}
          />
        ))}
      </div>
      {noOfPages > 1 && (
        <div className="flex items-center  justify-center space-x-1 p-8">
          {pages.map((page) => (
            <span
              onClick={() => setActivePage(page)}
              key={page}
              className={`text-sm font-bold cursor-pointer leading-normal flex size-10 items-center justify-center text-white rounded-full ${
                activePage === page
                  ? "bg-primary"
                  : "bg-surface border border-default text-primary hover-primary hover:!text-white "
              }`}
            >
              {page}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export default FindAllMentors;
