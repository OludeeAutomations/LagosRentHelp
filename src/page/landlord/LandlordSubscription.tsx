import { Check, CreditCard, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  "Publish property listings after landlord verification",
  "Receive genuine renter enquiries",
  "Use renter-to-property matching",
  "Manage listing availability and your profile",
  "Access account security and two-factor authentication",
];

const LandlordSubscription = () => (
  <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
    <div className="w-full space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#143f2b] px-6 py-10 text-white sm:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[44px] border-sky-200/20 bg-sky-200/10 sm:h-80 sm:w-80 sm:border-[50px]" />
          <span className="absolute -bottom-32 right-20 h-64 w-64 rounded-full border-[42px] border-sky-200/20 bg-sky-200/10 sm:h-72 sm:w-72 sm:border-[48px]" />
        </div>
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold"><Gift className="h-4 w-4" />Free access</span>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">LagosRentHelp is free for landlords right now.</h2>
            <p className="mt-4 max-w-xl leading-7 text-white/75">There is no subscription charge, no credit-card form and no payment required. You can use the landlord tools included below at no cost during this free-access period.</p>
          </div>
          <div className="min-w-64 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-white/70">Current plan</p>
            <p className="mt-2 text-2xl font-bold">Free</p>
            <p className="mt-1 text-sm text-white/70">₦0 · No card required</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-950"><ShieldCheck className="h-4 w-4" />Active</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><Sparkles className="h-6 w-6" /></span><div><h2 className="text-xl font-bold text-gray-950">Everything currently included</h2><p className="text-sm text-gray-500">Available to your verified landlord account.</p></div></div>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-6 text-gray-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[#129B36]"><Check className="h-3.5 w-3.5" /></span>{feature}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><CreditCard className="h-5 w-5" /></span>
            <h2 className="mt-5 text-lg font-bold text-gray-950">No billing details needed</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">We do not ask for card information on this page. If paid plans are introduced later, pricing will be shown clearly and you will choose whether to subscribe.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </main>
);

export default LandlordSubscription;
