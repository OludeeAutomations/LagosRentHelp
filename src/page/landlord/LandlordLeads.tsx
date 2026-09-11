import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  landlordLeadService,
  type LandlordLeadResult,
  type LeadStatus,
} from "@/services/landlordLeadService";

const PAGE_SIZE = 10;
const emptyResult: LandlordLeadResult = {
  items: [],
  filteredTotal: 0,
  total: 0,
  newCount: 0,
  contactedCount: 0,
  qualifiedCount: 0,
  closedCount: 0,
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const whatsappUrl = (phone: string, renterName: string, propertyTitle: string) => {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "234");
  const message = `Hello ${renterName}, I am following up on your enquiry about ${propertyTitle} on LagosRentHelp.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

const LandlordLeads = () => {
  const [result, setResult] = useState<LandlordLeadResult>(emptyResult);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await landlordLeadService.getMine({
        page,
        pageSize: PAGE_SIZE,
        status: status === "all" ? undefined : status,
        search,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your leads.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const updateStatus = async (leadId: string, nextStatus: LeadStatus) => {
    try {
      await landlordLeadService.updateStatus(leadId, nextStatus);
      await loadLeads();
      toast.success("Lead status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this lead.");
    }
  };

  const pageCount = Math.max(1, Math.ceil(result.filteredTotal / PAGE_SIZE));
  const summary = [
    { label: "All leads", value: result.total, tone: "bg-slate-900 text-white" },
    { label: "New", value: result.newCount, tone: "bg-amber-50 text-amber-700" },
    { label: "Contacted", value: result.contactedCount, tone: "bg-blue-50 text-blue-700" },
    { label: "Qualified", value: result.qualifiedCount, tone: "bg-green-50 text-green-700" },
  ];

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-gray-500">{item.label}</p><p className="mt-1 text-3xl font-bold text-gray-950">{item.value}</p></div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}><UsersRound className="h-5 w-5" /></span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center">
            <form
              className="flex min-w-0 flex-1 gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
                setSearch(searchInput.trim());
              }}>
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search renter or property" className="pl-9" />
              </div>
              <Button type="submit" variant="outline">Search</Button>
            </form>
            <Select value={status} onValueChange={(value) => { setStatus(value as LeadStatus | "all"); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => void loadLeads()} aria-label="Refresh leads"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-gray-500">Loading genuine enquiries...</p>
          ) : result.items.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <UsersRound className="mx-auto h-11 w-11 text-gray-300" />
              <h2 className="mt-4 font-semibold text-gray-950">No enquiries yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">When a signed-in renter calls or opens WhatsApp from one of your listings, the genuine enquiry will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="px-5 py-4">Renter</th><th className="px-5 py-4">Property</th><th className="px-5 py-4">Enquiry</th><th className="px-5 py-4">Received</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Contact</th></tr>
                </thead>
                <tbody className="divide-y">
                  {result.items.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-4"><p className="font-semibold text-gray-950">{lead.renter.name}</p><p className="mt-1 text-xs text-gray-500">{lead.renter.email || "Email unavailable"}</p><p className="text-xs text-gray-500">{lead.renter.phone || "Phone unavailable"}</p></td>
                      <td className="px-5 py-4"><Link to={`/properties/${lead.property.id}`} className="font-medium text-[#129B36] hover:underline">{lead.property.title}</Link><p className="mt-1 max-w-52 truncate text-xs text-gray-500">{lead.property.location}</p><p className="text-xs text-gray-500">{formatPrice(lead.property.price)}</p></td>
                      <td className="px-5 py-4 capitalize"><span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{lead.channel === "whatsapp" ? <MessageCircle className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}{lead.channel}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">{formatDate(lead.createdAt)}</td>
                      <td className="px-5 py-4"><Select value={lead.status} onValueChange={(value) => void updateStatus(lead.id, value as LeadStatus)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2">{lead.renter.email && <Button asChild variant="outline" size="icon"><a href={`mailto:${lead.renter.email}?subject=${encodeURIComponent(`Your enquiry about ${lead.property.title}`)}`} aria-label={`Email ${lead.renter.name}`}><Mail className="h-4 w-4" /></a></Button>}{lead.renter.phone && <><Button asChild variant="outline" size="icon"><a href={`tel:${lead.renter.phone}`} aria-label={`Call ${lead.renter.name}`}><Phone className="h-4 w-4" /></a></Button><Button asChild variant="outline" size="icon"><a href={whatsappUrl(lead.renter.phone, lead.renter.name, lead.property.title)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${lead.renter.name}`}><MessageCircle className="h-4 w-4 text-[#129B36]" /></a></Button></>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.filteredTotal > 0 && (
            <div className="flex items-center justify-between border-t px-5 py-4 text-sm text-gray-500">
              <p>Page {page} of {pageCount} · {result.filteredTotal} result{result.filteredTotal === 1 ? "" : "s"}</p>
              <div className="flex gap-2"><Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button></div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default LandlordLeads;
