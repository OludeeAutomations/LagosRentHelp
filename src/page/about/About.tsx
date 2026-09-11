import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const principles = [
  {
    icon: ShieldCheck,
    title: "Trust before visibility",
    description: "Landlords submit identity and property-ownership evidence before they can publish listings.",
  },
  {
    icon: MapPin,
    title: "Built around Lagos",
    description: "Search and onboarding use Lagos LGAs, local rental language, and the details renters actually need.",
  },
  {
    icon: HeartHandshake,
    title: "Useful, not intrusive",
    description: "Private renter preferences improve recommendations without exposing personal profile answers to landlords.",
  },
];

const verificationSteps = [
  { number: "01", title: "Identity check", description: "A landlord completes identity verification and provides a clear identity image." },
  { number: "02", title: "Ownership evidence", description: "The property address, Lagos LGA, and primary title document are submitted securely." },
  { number: "03", title: "Human review", description: "An administrator compares the verified identity with the ownership information." },
  { number: "04", title: "Publish directly", description: "Once approved, a landlord can publish listings immediately without a second review queue." },
];

const About = () => (
  <div className="overflow-hidden bg-[#f7f9f7] text-gray-950">
    <section className="relative isolate bg-[#173f2a] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(34,197,94,0.24),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.1),transparent_34%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-green-100">
            <Building2 className="h-4 w-4" /> About LagosRentHelp
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            A clearer way to find and offer homes in Lagos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50/80">
            LagosRentHelp brings renters and verified property owners into one focused marketplace—designed to reduce uncertainty, improve discovery, and make every next step easier to understand.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-[#18a83f] px-5 py-3 font-semibold text-white transition hover:bg-[#129B36]">
              Explore homes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
              Create an account
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.1 }} className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/20">
            <img src="/gettyimages-923379128-612x612.jpg" alt="A view across Lagos" className="h-[420px] w-full rounded-[1.55rem] object-cover" />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/95 p-4 text-gray-950 shadow-xl backdrop-blur sm:left-auto sm:w-72">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><BadgeCheck className="h-6 w-6" /></span>
              <div><p className="font-semibold">Reviewed ownership</p><p className="text-sm text-gray-500">Confidence starts before a listing goes live.</p></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">Why we exist</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Less guesswork. Better rental decisions.</h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              House hunting in Lagos often means scattered information, unclear ownership, and wasted journeys. We are building a more organised path from discovery to direct contact.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            {principles.map(({ icon: Icon, title, description }, index) => (
              <motion.article key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-2xl border border-gray-200 bg-[#fafcfb] p-6">
                <div className="flex items-start gap-4">
                  <span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><Icon className="h-6 w-6" /></span>
                  <div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 leading-7 text-gray-600">{description}</p></div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">Our trust process</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Verification with a human decision at the centre.</h2>
          <p className="mt-4 leading-7 text-gray-600">Technology helps collect and protect the information. A trained administrator makes the approval decision.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {verificationSteps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-sm font-bold text-[#129B36]">{step.number}</span>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-7 text-gray-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-[#173f2a] py-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-3xl">
          <img src="/istockphoto-1145244310-612x612.jpg" alt="Lagos city and lagoon" className="h-[390px] w-full object-cover" />
        </div>
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-green-300"><MapPin className="h-4 w-4" />Made for Lagos</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">One city. Twenty LGAs. Many different rental needs.</h2>
          <p className="mt-5 text-lg leading-8 text-green-50/75">
            From move-in timing and yearly budget to property type and occupancy, our matching tools organise the details that matter while keeping sensitive renter answers private.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Lagos LGA-based discovery", "Private renter preferences", "Reviewed landlord applications", "Clear listing information"].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-green-50"><CheckCircle2 className="h-5 w-5 text-green-300" />{item}</p>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <span className="inline-flex rounded-full bg-green-50 p-3 text-[#129B36]"><Users className="h-6 w-6" /></span>
        <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Find your next home—or bring the right property to market.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">Choose the path that fits you and complete one clear onboarding process.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-[#129B36] px-6 py-3 font-semibold text-white hover:bg-[#0e7d2b]"><Search className="h-4 w-4" />Find a home</Link>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50">List a property <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
