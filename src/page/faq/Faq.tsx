import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Home,
  Shield,
  MessageCircle,
  CreditCard,
} from "lucide-react";

const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const categories = {
    general: [
      {
        question: "What is LagosHomes?",
        answer:
          "LagosHomes is a platform connecting property owners and verified agents with tenants looking for both short-term stays and long-term rentals in Lagos. We focus on providing quality, affordable housing options across all areas of Lagos State.",
      },
      {
        question: "Is LagosHomes free to use?",
        answer:
          "For tenants: Yes, searching for properties and contacting agents is completely free. For agents: We offer a free trial with 2 listings, after which subscription plans are available for additional listings and features.",
      },
      {
        question: "How do I create an account?",
        answer:
          "Click on the 'Sign Up' button in the top navigation. You'll need to provide your basic information and verify your email address. For agents, additional verification steps are required.",
      },
    ],
    agents: [
      {
        question: "How do I become a verified agent?",
        answer:
          "To become a verified agent, you need to complete our registration process which includes ID verification, phone number confirmation, and background checks. Once verified, you'll receive a verification badge on your profile.",
      },
      {
        question: "What are the benefits of being a verified agent?",
        answer:
          "Verified agents get priority listing placement, access to premium features, increased trust from tenants, higher conversion rates, and dedicated support from our team.",
      },
      {
        question: "How many properties can I list?",
        answer:
          "New agents get 2 free listings during their trial period. After that, you can choose from our Basic or Premium subscription plans which offer 5 and 15 listings respectively, with additional features.",
      },
    ],
    tenants: [
      {
        question: "How do I know if an agent is verified?",
        answer:
          "Verified agents have a green verification badge (checkmark) next to their name on their profile and property listings. You can also view their verification status in the agent details section.",
      },
      {
        question: "Is it safe to contact agents directly?",
        answer:
          "Yes, all our agents undergo thorough verification. However, we always recommend meeting in public places for property viewings, not sharing sensitive financial information upfront, and using our platform for initial communications.",
      },
      {
        question: "What should I do if I encounter a suspicious listing?",
        answer:
          "Immediately report the listing using the 'Report' button on the property page or contact our support team directly via WhatsApp or email. We investigate all reports within 24 hours.",
      },
    ],
    technical: [
      {
        question: "The website isn't loading properly. What should I do?",
        answer:
          "Try refreshing the page, clearing your browser cache, or using a different browser. If the issue persists, contact our technical support team with details about your device and browser.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Click on 'Forgot Password' on the login page. Enter your email address, and we'll send you a password reset link. Check your spam folder if you don't see the email within a few minutes.",
      },
      {
        question: "Is there a mobile app available?",
        answer:
          "Currently, we don't have a dedicated mobile app, but our website is fully optimized for mobile devices. You can add it to your home screen for an app-like experience on both iOS and Android.",
      },
    ],
  };

  const categoryIcons = {
    general: HelpCircle,
    agents: Shield,
    tenants: Home,
    technical: CreditCard,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#129B36] to-[#41614F] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto">
            Find answers to common questions about LagosHomes
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-16">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-4 justify-center mb-12">
          {Object.entries(categoryIcons).map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-300 ${
                activeCategory === key
                  ? "bg-[#129B36] text-white"
                  : "bg-white text-[#0E0E0E] hover:bg-[#129B36]/10"
              }`}>
              <Icon className="h-5 w-5" />
              <span className="capitalize">{key}</span>
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4">
          {categories[activeCategory as keyof typeof categories].map(
            (item, index) => {
              const isOpen = openItems.has(index);
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-lg font-semibold text-[#0E0E0E] pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#129B36] transition-transform duration-200 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="px-6 pb-4">
                          <p className="text-[#7F8080] leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
          )}
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-[#0E0E0E] mb-4">
            Still have questions?
          </h2>
          <p className="text-[#7F8080] mb-6">
            Can't find the answer you're looking for? Our support team is here
            to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/2347082293054"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#129B36] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#41614F] transition-colors duration-300 flex items-center justify-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Chat on WhatsApp</span>
            </a>
            <a
              href="mailto:admin@lagosrenthelp.ng"
              className="bg-white text-[#129B36] border border-[#129B36] px-6 py-3 rounded-xl font-semibold hover:bg-[#129B36]/10 transition-colors duration-300">
              Send us an Email
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
