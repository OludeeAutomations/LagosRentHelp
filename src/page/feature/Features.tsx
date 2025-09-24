import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Home,
  MessageCircle,
  CheckCircle,
  Star,
  Users,
  Zap,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

const Features: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Agents & Properties",
      description:
        "Every agent and property undergoes rigorous verification to ensure authenticity and quality standards.",
    },
    {
      icon: Search,
      title: "Advanced Search Filters",
      description:
        "Find your perfect home with detailed filters for location, price, amenities, and property type.",
    },
    {
      icon: Home,
      title: "Short & Long Term Rentals",
      description:
        "Whether you need a place for a week or a year, we have options for every duration.",
    },
    {
      icon: MessageCircle,
      title: "Direct Messaging",
      description:
        "Communicate directly with property owners and agents through our secure messaging platform.",
    },
    {
      icon: CheckCircle,
      title: "Secure Identity Verification",
      description:
        "Comprehensive background checks and ID verification for all agents and property owners.",
    },
    {
      icon: Star,
      title: "Featured Listings",
      description:
        "Premium properties highlighted for maximum visibility and quicker rental matches.",
    },
    {
      icon: Users,
      title: "Community Reviews",
      description:
        "Read authentic reviews from previous tenants to make informed decisions.",
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description:
        "Get immediate alerts for new properties that match your criteria and important updates.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#129B36] to-[#41614F] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6">
            Platform Features
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto">
            Discover why thousands of Lagos residents choose us for their rental
            needs
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className=" md:px-5 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0E0E0E] mb-4">
              Everything You Need
            </h2>
            <p className="text-[#7F8080] text-lg max-w-2xl mx-auto">
              Our comprehensive platform is designed to make finding and renting
              properties in Lagos effortless
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-[#129B36] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0E0E0E] mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-[#7F8080]">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:px-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-[#0E0E0E] mb-6">
                Benefits for Everyone
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E0E0E] mb-2">
                      For Tenants
                    </h3>
                    <p className="text-[#7F8080]">
                      Find verified properties, communicate directly with
                      owners, and enjoy a secure rental process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E0E0E] mb-2">
                      For Property Owners
                    </h3>
                    <p className="text-[#7F8080]">
                      List your properties easily, reach qualified tenants, and
                      manage your rentals efficiently.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E0E0E] mb-2">
                      For Agents
                    </h3>
                    <p className="text-[#7F8080]">
                      Grow your business with our platform, access premium
                      listings, and build your reputation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#129B36] to-[#41614F] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">
                Why Choose Our Platform?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>100% verified properties and agents</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Transparent pricing with no hidden fees</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>24/7 customer support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Comprehensive property inspections</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Regular platform updates and improvements</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#129B36]/10 to-[#41614F]/10 md:px-5">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-[#0E0E0E] mb-6">
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-[#7F8080] text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found their perfect home
            through our platform
          </motion.p>
          <Link to="/register">
            {" "}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#129B36] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#41614F] transition-colors duration-300">
              Create Account
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;
