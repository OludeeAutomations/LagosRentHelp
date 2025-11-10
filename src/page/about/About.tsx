import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  Home,
  Target,
  Heart,
  MessageCircle,
} from "lucide-react";

const About: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Agents & Properties",
      description:
        "All our agents and properties undergo thorough verification to ensure genuine listings and professional service.",
    },
    {
      icon: MapPin,
      title: "Lagos Coverage",
      description:
        "Comprehensive coverage across all Lagos State local government areas with detailed local knowledge.",
    },
    {
      icon: Phone,
      title: "Direct WhatsApp Contact",
      description:
        "Connect directly with property agents via WhatsApp for immediate response and seamless communication.",
    },
    {
      icon: Home,
      title: "Affordable Focus",
      description:
        "Specializing in budget-friendly options including single rooms, self-contain apartments, and mini flats.",
    },
    {
      icon: MessageCircle,
      title: "Mobile Optimized",
      description:
        "Designed for Nigerian mobile users with fast loading times and data-friendly interfaces.",
    },
    {
      icon: CheckCircle,
      title: "Safety First",
      description:
        "Clear safety warnings and tips to help users avoid rental scams and fraudulent listings.",
    },
  ];

  const stats = [
    { number: "500+", label: "Properties Listed" },
    { number: "100+", label: "Verified Agents" },
    { number: "20+", label: "Lagos Areas" },
    { number: "1000+", label: "Happy Tenants" },
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
            About LagosRentHelp
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto">
            Connecting Lagos residents with verified agents and quality
            affordable housing
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:px-5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-[#0E0E0E] mb-6">
                Our Mission
              </h2>
              <p className="text-[#7F8080] text-lg mb-6">
                We're on a mission to make finding affordable, quality housing
                in Lagos State as easy as possible. Our platform connects
                genuine property seekers with verified agents, ensuring
                transparent transactions and reducing the stress of house
                hunting in Nigeria's commercial capital.
              </p>
              <p className="text-[#7F8080] text-lg mb-8">
                To revolutionize the real estate rental market in Lagos by
                creating a transparent, secure, and efficient platform that
                connects property owners with qualified tenants.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#129B36] rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-semibold text-[#0E0E0E]">
                  Making Lagos feel like home
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-[#129B36] mb-2">
                  500+
                </div>
                <div className="text-[#7F8080]">Properties Listed</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-[#129B36] mb-2">
                  100+
                </div>
                <div className="text-[#7F8080]">Verified Agents</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-[#129B36] mb-2">
                  20+
                </div>
                <div className="text-[#7F8080]">Lagos Areas</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-[#129B36] mb-2">
                  1000+
                </div>
                <div className="text-[#7F8080]">Happy Tenants</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white md:px-5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0E0E0E] mb-4">
              Why Choose LagosRentHelp?
            </h2>
            <p className="text-[#7F8080] text-lg max-w-2xl mx-auto">
              We offer unique features designed specifically for the Lagos
              rental market
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-[#129B36] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0E0E0E] mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-[#7F8080] text-center">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 md:px-5 bg-gradient-to-r from-[#129B36]/10 to-[#41614F]/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-[#0E0E0E] mb-6">
                Our Commitment
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E0E0E] mb-2">
                      Building Trust
                    </h3>
                    <p className="text-[#7F8080]">
                      We understand the challenges of finding reliable
                      accommodation in Lagos. That's why we've built a platform
                      that prioritizes transparency, affordability, and genuine
                      connections.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E0E0E] mb-2">
                      Community Focus
                    </h3>
                    <p className="text-[#7F8080]">
                      We believe in building communities, not just renting
                      properties. Your satisfaction is our priority.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#129B36] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0E0E0E] mb-2">
                      Safety First
                    </h3>
                    <p className="text-[#7F8080]">
                      Clear safety warnings and tips to help users avoid rental
                      scams and fraudulent listings.
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
              className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#0E0E0E] mb-6">
                Free Trial for Agents
              </h3>
              <p className="text-[#7F8080] mb-6">
                New agents get 2 free listings to test our platform before
                subscribing to a plan. Experience the benefits of our verified
                platform risk-free.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#129B36]" />
                  <span className="text-[#0E0E0E]">No upfront costs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#129B36]" />
                  <span className="text-[#0E0E0E]">Full platform access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#129B36]" />
                  <span className="text-[#0E0E0E]">Priority verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#129B36]" />
                  <span className="text-[#0E0E0E]">
                    Direct tenant connections
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:px-5 bg-[#41614F] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-gray-300">
              Making a difference in Lagos housing market
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:px-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#0E0E0E] mb-6">
              Our Story
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-[#7F8080] text-lg mb-6">
              Founded in 2025, LagosRentHelp was born out of a need for a more
              transparent and reliable rental market in Lagos. Our founders,
              experienced in both real estate and technology, saw an opportunity
              to create a platform that would benefit both property owners and
              tenants.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-[#7F8080] text-lg">
              Today, we're proud to be Lagos' fastest-growing rental platform,
              connecting thousands of tenants with quality homes and helping
              property owners maximize their investments.
            </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
