import React from "react";
import { motion } from "framer-motion";
import { FileText, Scale, Shield, AlertCircle } from "lucide-react";

const TermsOfService: React.FC = () => {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content:
        "By accessing or using the LagosHomes platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
    },
    {
      icon: Scale,
      title: "User Accounts",
      content:
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to use our services.",
    },
    {
      icon: Shield,
      title: "Property Listings",
      content:
        "Property owners and agents are responsible for the accuracy of their listings. We reserve the right to remove any listing that violates our policies or contains misleading information.",
    },
    {
      icon: AlertCircle,
      title: "Prohibited Activities",
      content:
        "You agree not to engage in any fraudulent activities, misrepresent properties, harass other users, or violate any applicable laws while using our platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0E0E0E] mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-[#7F8080]">
            Effective date: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <p className="text-[#7F8080] leading-relaxed">
            Welcome to LagosHomes. These Terms of Service govern your use of our
            platform and services. Please read these terms carefully before
            using our services.
          </p>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center mr-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#0E0E0E]">
                    {section.title}
                  </h2>
                </div>
                <p className="text-[#7F8080] leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-semibold text-[#0E0E0E] mb-6">
            Additional Terms
          </h2>
          <div className="space-y-4 text-[#7F8080]">
            <p>
              <strong>Limitation of Liability:</strong> LagosHomes is not
              responsible for the quality, safety, or legality of properties
              listed on our platform. Users are responsible for verifying
              property details before making rental decisions.
            </p>
            <p>
              <strong>Intellectual Property:</strong> All content on our
              platform, including logos, text, and graphics, is the property of
              LagosHomes and protected by intellectual property laws.
            </p>
            <p>
              <strong>Termination:</strong> We reserve the right to suspend or
              terminate your account if you violate these terms or engage in
              fraudulent activities.
            </p>
            <p>
              <strong>Governing Law:</strong> These terms are governed by the
              laws of Nigeria. Any disputes shall be resolved in the courts of
              Lagos State.
            </p>
            <p>
              <strong>Contact:</strong> For questions about these terms, contact
              us at legal@lagoshomes.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
