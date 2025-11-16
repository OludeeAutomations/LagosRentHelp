import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { agentService } from "@/services/agentService";

interface Agent {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  bio: string;
  verificationStatus: string;
  address: string;
  idPhoto: string;
  whatsappNumber: string;
  subscriptionPlan: string;
  totalLeads: number;
  rating: number;
}

const TopAgentsCarousel: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        const res = await agentService.getTopAgents();
        console.log(res);
        // Adjust based on your API response structure
        if (res.success) {
          setAgents(res.data);
        } else {
          setAgents([]);
        }
      } catch (error) {
        console.error("Failed to fetch top agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAgents();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({
      left: scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading) return <div>Loading top agents...</div>;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#0E0E0E]">
          Meet Our Top Agents
        </h2>
        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            &#8592;
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            &#8594;
          </button>

          {/* Agents Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 scrollbar-hide snap-x snap-mandatory scroll-smooth justify-center"
          >
            {agents.map((agent) => (
              <motion.div
                key={agent._id}
                className="flex-none w-64 sm:w-72 md:w-80 bg-white rounded-2xl shadow-lg p-6 snap-start cursor-pointer hover:scale-105 transition-transform flex flex-col"
                onClick={() => navigate(`/agents/${agent.userId._id}`)}
                style={{ height: "420px" }}
              >
                <img
                  src={agent.idPhoto}
                  alt={agent.userId.name}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
                <h3 className="text-lg font-bold text-[#0E0E0E] truncate">
                  {agent.userId.name}
                </h3>
                <p className="text-sm text-[#7F8080] mb-2 line-clamp-3 overflow-hidden">
                  {agent.bio}
                </p>
                <p className="text-sm font-semibold text-[#129B36] mt-auto">
                  {agent.verificationStatus === "verified"
                    ? "Verified Agent"
                    : "Pending Verification"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopAgentsCarousel;
