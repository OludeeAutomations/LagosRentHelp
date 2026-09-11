import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  MapPinned,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: UserRoundCheck,
    title: "Landlord identity checks",
    description: "Landlords complete an identity-verification step before submitting ownership information.",
  },
  {
    icon: FileCheck2,
    title: "Ownership review",
    description: "Property title evidence is stored privately and reviewed by an administrator before approval.",
  },
  {
    icon: Sparkles,
    title: "Personalised matching",
    description: "Approved listings are ranked using a renter’s budget, location, timing, household, and rental needs.",
  },
  {
    icon: MapPinned,
    title: "Lagos-focused discovery",
    description: "Search by Lagos location, property type, price range, and listing duration without generic clutter.",
  },
  {
    icon: ShieldCheck,
    title: "Private preference profiles",
    description: "Renter profile answers are used for matching and are not displayed publicly or exposed to landlords.",
  },
  {
    icon: Building2,
    title: "Landlord workspace",
    description: "Verified owners can create listings and follow their approval, availability, views, and engagement.",
  },
];

const renterSteps = [
  "Create a renter account",
  "Set private rental preferences",
  "Browse ranked available listings",
  "Open a listing and contact the owner",
];

const landlordSteps = [
  "Create a landlord account",
  "Complete identity and ownership verification",
  "Add property details and tenant requirements",
  "Publish the listing immediately",
];

const Features = () => (
  <div className="overflow-hidden bg-[#f7f9f7] text-gray-950">
    <section className="relative bg-white">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,#ecfdf3_0%,#ffffff_55%,#eef5f0_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-[#129B36] shadow-sm">
            <Sparkles className="h-4 w-4" />Purpose-built for renting in Lagos
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            The important rental details, organised in one place.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            From landlord verification to private renter matching, every feature is designed to make discovery clearer and reduce avoidable risk.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/search" className="inline-flex items-center gap-2 rounded-xl bg-[#129B36] px-6 py-3 font-semibold text-white transition hover:bg-[#0e7d2b]">Browse listings <Search className="h-4 w-4" /></Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold transition hover:bg-gray-50">Get started <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">Core features</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">A better foundation for both sides of a rental.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-950/5">
              <span className="inline-flex rounded-xl bg-green-50 p-3 text-[#129B36] transition group-hover:bg-[#129B36] group-hover:text-white"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-gray-600">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]">How it works</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">A clear route for renters and landlords.</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-3xl bg-[#173f2a] p-7 text-white sm:p-9">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[38px] border-white/5" />
            <div className="relative">
              <span className="inline-flex rounded-xl bg-white/10 p-3"><Search className="h-6 w-6 text-green-300" /></span>
              <h3 className="mt-5 text-2xl font-bold">For renters</h3>
              <p className="mt-2 text-green-50/70">Tell us what fits. We organise available homes around those needs.</p>
              <ol className="mt-8 space-y-4">
                {renterSteps.map((step, index) => <li key={step} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-green-200">{index + 1}</span><span>{step}</span></li>)}
              </ol>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-gray-200 bg-[#f8faf8] p-7 sm:p-9">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[38px] border-[#129B36]/5" />
            <div className="relative">
              <span className="inline-flex rounded-xl bg-green-100 p-3"><KeyRound className="h-6 w-6 text-[#129B36]" /></span>
              <h3 className="mt-5 text-2xl font-bold">For landlords</h3>
              <p className="mt-2 text-gray-600">Verify once, manage clearly, and submit better property information.</p>
              <ol className="mt-8 space-y-4">
                {landlordSteps.map((step, index) => <li key={step} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-[#129B36]">{index + 1}</span><span>{step}</span></li>)}
              </ol>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-3xl border border-green-100 bg-green-50 p-7 sm:p-10 lg:grid-cols-[1fr_.8fr]">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#129B36]"><ShieldCheck className="h-4 w-4" />Privacy by design</span>
            <h2 className="mt-4 text-3xl font-bold">Matching without publishing your personal profile.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-gray-600">
              Budget, income band, employment arrangement, household size, pets, smoking, and move-in timing are used privately to rank listings. They are not shown on public property cards.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
            {["All available listings remain searchable", "Sensitive answers stay private", "Shared-home gender matching is optional", "Religion and marital status are not used"].map((item) => (
              <p key={item} className="flex items-start gap-3 text-sm text-gray-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#129B36]" />{item}</p>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#173f2a] py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <SlidersHorizontal className="mx-auto h-9 w-9 text-green-300" />
        <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Set your preferences once. Browse with more direction.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-green-50/75">Create your profile and let LagosRentHelp bring the most relevant available listings forward.</p>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#173f2a] hover:bg-green-50">Create your account <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  </div>
);

export default Features;
