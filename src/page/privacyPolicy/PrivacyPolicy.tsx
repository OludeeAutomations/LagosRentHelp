import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, User } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      icon: User,
      title: "Information We Collect",
      content:
        "We collect information you provide directly to us, including when you create an account, list a property, search for properties, or contact us. This may include your name, email address, phone number, property details, and any other information you choose to provide.",
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content:
        "We use the information we collect to provide, maintain, and improve our services, communicate with you about properties, send you technical notices and security alerts, and respond to your comments and questions.",
    },
    {
      icon: Shield,
      title: "Information Sharing",
      content:
        "We may share your information with property owners/agents when you express interest in a property, with service providers who help us operate our platform, or when required by law. We never sell your personal information to third parties.",
    },
    {
      icon: Eye,
      title: "Your Choices",
      content:
        "You can update your account information, adjust your notification preferences, and opt-out of marketing communications at any time through your account settings or by contacting us.",
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
            Privacy Policy
          </h1>
          <p className="text-xl text-[#7F8080]">
            Last updated: {new Date().toLocaleDateString()}
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
            At LagosHomes, we take your privacy seriously. This Privacy Policy
            describes how we collect, use, and share your personal information
            when you use our platform. By using our services, you agree to the
            collection and use of information in accordance with this policy.
          </p>
        </motion.div>

        {/* Policy Sections */}
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

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-semibold text-[#0E0E0E] mb-6">
            Additional Information
          </h2>
          <div className="space-y-4 text-[#7F8080]">
            <p>
              <strong>Data Security:</strong> We implement appropriate security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
            <p>
              <strong>Data Retention:</strong> We retain your personal
              information only for as long as necessary to fulfill the purposes
              outlined in this policy.
            </p>
            <p>
              <strong>Changes to This Policy:</strong> We may update this
              privacy policy from time to time. We will notify you of any
              changes by posting the new policy on this page.
            </p>
            <p>
              <strong>Contact Us:</strong> If you have any questions about this
              Privacy Policy, please contact us at privacy@lagoshomes.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
