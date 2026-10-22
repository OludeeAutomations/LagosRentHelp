import { ChevronDown, LogIn, LogOut, Menu, MessageSquareText, Search, Settings, ShieldCheck, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const AreaReviewsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, initialize, signOut } = useAreaReviewsAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const returnTo = `${location.pathname}${location.search}`;
  const isAuthPage = location.pathname === "/area-reviews/login"
    || location.pathname === "/area-reviews/register"
    || location.pathname.startsWith("/area-reviews/auth/");

  useEffect(() => initialize(), [initialize]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const closeMenu = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileOpen(false);
      setAccountMenuOpen(false);
      toast.success("You have been signed out of Area Reviews.");
      navigate("/area-reviews", { replace: true });
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  const navigation = [
    { label: "Explore areas", href: "/area-reviews/areas", icon: Search },
    { label: "Share a review", href: "/area-reviews/write", icon: MessageSquareText },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f1]">
      {!isAuthPage && <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/area-reviews" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <img src="/icon.png" alt="LagosRentHelp" className="h-11 w-11 object-contain" />
            <span>
              <span className="block text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">LagosRentHelp</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#129B36]">Area Reviews</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = location.pathname.startsWith(href);
              return <Link key={href} to={href} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-green-50 text-[#0e7d2b]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon className="h-4 w-4" />{label}</Link>;
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!loading && user ? <>
              <div ref={accountMenuRef} className="relative">
                <button type="button" onClick={() => setAccountMenuOpen((open) => !open)} aria-expanded={accountMenuOpen} aria-haspopup="menu" className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-3 transition hover:border-green-200 hover:bg-green-50/50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#129B36] text-xs font-bold text-white">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
                  <span className="max-w-32 truncate text-sm font-semibold text-slate-700">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {accountMenuOpen && <div role="menu" className="absolute right-0 top-[calc(100%+0.65rem)] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"><div className="border-b border-slate-100 px-3 py-2.5"><p className="truncate text-sm font-bold text-slate-900">{user.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p></div><Link to="/area-reviews/settings" role="menuitem" onClick={() => setAccountMenuOpen(false)} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-green-50 hover:text-[#0e7d2b]"><Settings className="h-4 w-4" />Account settings</Link><button type="button" role="menuitem" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"><LogOut className="h-4 w-4" />Log out</button></div>}
              </div>
            </> : !loading && <>
              <Link to="/area-reviews/login" state={{ from: returnTo }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-[#0e7d2b]"><LogIn className="h-4 w-4" />Sign in</Link>
              <Link to="/area-reviews/register" className="inline-flex items-center gap-2 rounded-xl bg-[#129B36] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e7d2b]"><UserPlus className="h-4 w-4" />Create account</Link>
            </>}
          </div>

          <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 md:hidden" aria-label="Toggle Area Reviews menu">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1">
              {navigation.map(({ label, href, icon: Icon }) => <Link key={href} to={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50"><Icon className="h-5 w-5 text-[#129B36]" />{label}</Link>)}
              {!loading && !user && <><Link to="/area-reviews/login" state={{ from: returnTo }} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50"><LogIn className="h-5 w-5 text-[#129B36]" />Sign in</Link><Link to="/area-reviews/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50"><UserPlus className="h-5 w-5 text-[#129B36]" />Create account</Link></>}
              {!loading && user && <><div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#129B36] text-xs font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</span>Signed in as {user.name.split(" ")[0]}</div><Link to="/area-reviews/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50"><Settings className="h-5 w-5 text-[#129B36]" />Account settings</Link><button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"><LogOut className="h-5 w-5" />Log out</button></>}
            </nav>
          </div>
        )}
      </header>}

      <main className="flex-1"><Outlet /></main>

      {!isAuthPage && <footer className="border-t border-white/10 bg-[#0c3021] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div><div className="flex items-center gap-3"><img src="/icon.png" alt="" className="h-10 w-10 object-contain" /><span><span className="block font-bold">LagosRentHelp</span><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4ce70]">Area Reviews</span></span></div><p className="mt-4 max-w-md text-sm leading-7 text-green-50/65">Honest, moderated housing experiences shared by Lagos residents.</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-100/50">Explore</p><div className="mt-4 space-y-3 text-sm"><Link to="/area-reviews/areas" className="block text-green-50/75 hover:text-white">Browse all LGAs</Link><Link to="/area-reviews/write" className="block text-green-50/75 hover:text-white">Share a review</Link></div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-100/50">Trust</p><div className="mt-4 space-y-3 text-sm"><span className="flex items-center gap-2 text-green-50/75"><ShieldCheck className="h-4 w-4" />Moderated reviews</span><Link to="/privacy" className="block text-green-50/75 hover:text-white">Privacy policy</Link></div></div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-green-50/45">© {new Date().getFullYear()} LagosRentHelp Area Reviews</div>
      </footer>}
    </div>
  );
};

export default AreaReviewsLayout;
