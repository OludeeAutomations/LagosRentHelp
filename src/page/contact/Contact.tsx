import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from "lucide-react";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage(
        "Thank you for your message! We'll get back to you within 24 hours."
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#129B36] to-[#41614F] text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6">
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto">
            We're here to help with all your Lagos rental needs
          </motion.p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#0E0E0E] mb-4">
                  Send us a Message
                </h2>
                <p className="text-[#7F8080]">
                  Have questions? We'd love to hear from you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#129B36] focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#129B36] focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#129B36] focus:border-transparent">
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="agent">Agent Registration</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="report">Report a Problem</option>
                    <option value="partnership">
                      Partnership Opportunities
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#129B36] focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#129B36] text-white py-3 rounded-xl font-semibold hover:bg-[#41614F] transition-colors duration-300 disabled:opacity-50 flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>

              {submitMessage && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm font-medium text-green-800">
                    {submitMessage}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#0E0E0E] mb-6">
                  Contact Information
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#129B36]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-[#129B36]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0E0E0E] mb-1">
                        Phone Support
                      </h4>
                      <p className="text-[#7F8080] mb-2">+234 708 229 3054</p>
                      <p className="text-sm text-[#7F8080]">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#129B36]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-[#129B36]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0E0E0E] mb-1">
                        WhatsApp Support
                      </h4>
                      <p className="text-[#7F8080] mb-2">+234 708 229 3054</p>
                      <p className="text-sm text-[#7F8080]">
                        Quick responses, 7 days a week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#129B36]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-[#129B36]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0E0E0E] mb-1">
                        Email Support
                      </h4>
                      <a
                        href="mailTo=`info@lagosrenthelp.ng`"
                        className="text-[#7F8080] mb-2">
                        info@lagosrenthelp.ng
                      </a>
                      <p className="text-sm text-[#7F8080]">
                        We reply within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#129B36]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-[#129B36]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0E0E0E] mb-1">
                        Office Address
                      </h4>
                      <p className="text-[#7F8080] mb-2">
                        Lagos State
                        <br />
                        Nigeria
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#129B36]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#129B36]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0E0E0E] mb-1">
                        Business Hours
                      </h4>
                      <p className="text-[#7F8080] mb-2">
                        Monday - Friday: 8:00 AM - 6:00 PM
                      </p>
                      <p className="text-sm text-[#7F8080]">
                        Saturday: 9:00 AM - 4:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-[#0E0E0E] mb-4">
                  Frequently Asked
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[#0E0E0E] mb-1">
                      How do I verify an agent?
                    </h4>
                    <p className="text-sm text-[#7F8080]">
                      All our agents are pre-verified. Look for the verified
                      badge on their profiles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0E0E0E] mb-1">
                      Is the platform free for renters?
                    </h4>
                    <p className="text-sm text-[#7F8080]">
                      Yes! Searching and contacting agents is completely free
                      for property seekers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0E0E0E] mb-1">
                      How do I report suspicious listings?
                    </h4>
                    <p className="text-sm text-[#7F8080]">
                      Use our contact form or WhatsApp us directly to report any
                      concerns.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
