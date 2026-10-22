import { LogIn, MapPinned, Menu, MessageSquareText, Search, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const AreaReviewsLayout = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const returnTo = `${location.pathname}${location.search}`;

  const navigation = [
    { label: "Explore areas", href: "/area-reviews", icon: Search },
    { label: "Share a review", href: "/area-reviews/write", icon: MessageSquareText },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f1]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/area-reviews" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#103f2b] text-white shadow-sm"><MapPinned className="h-5 w-5" /></span>
            <span>
              <span className="block text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">Lagos Area Reviews</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#129B36]">Resident guide</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = href === "/area-reviews" ? location.pathname === href : location.pathname.startsWith(href);
              return <Link key={href} to={href} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-green-50 text-[#0e7d2b]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="h-4 w-4" />{label}</Link>;
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#129B36] text-xs font-bold text-white">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
                <span className="max-w-32 truncate text-sm font-semibold text-slate-700">{user.name.split(" ")[0]}</span>
              </div>
            ) : (
              <Link to="/login?source=area-reviews" state={{ from: returnTo }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-[#0e7d2b]"><LogIn className="h-4 w-4" />Sign in</Link>
            )}
          </div>

          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 md:hidden" aria-label="Toggle Area Reviews menu">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1">
              {navigation.map(({ label, href, icon: Icon }) => <Link key={href} to={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50"><Icon className="h-5 w-5 text-[#129B36]" />{label}</Link>)}
              {!user && <Link to="/login?source=area-reviews" state={{ from: returnTo }} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50"><LogIn className="h-5 w-5 text-[#129B36]" />Sign in</Link>}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-white/10 bg-[#0c3021] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><MapPinned className="h-5 w-5 text-[#f4ce70]" /></span><span className="font-bold">Lagos Area Reviews</span></div><p className="mt-4 max-w-md text-sm leading-7 text-green-50/65">Honest, moderated housing experiences shared by Lagos residents. A community project by LagosRentHelp.</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-100/50">Explore</p><div className="mt-4 space-y-3 text-sm"><Link to="/area-reviews" className="block text-green-50/75 hover:text-white">Browse areas</Link><Link to="/area-reviews/write" className="block text-green-50/75 hover:text-white">Share a review</Link></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-100/50">Trust</p><div className="mt-4 space-y-3 text-sm"><span className="flex items-center gap-2 text-green-50/75"><ShieldCheck className="h-4 w-4" />Moderated reviews</span><Link to="/privacy" className="block text-green-50/75 hover:text-white">Privacy policy</Link></div></div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-green-50/45">© {new Date().getFullYear()} Lagos Area Reviews · Powered by LagosRentHelp</div>
      </footer>
    </div>
  );
};

export default AreaReviewsLayout;
