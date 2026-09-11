import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  BadgeCheck,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminVerificationService,
  type LandlordVerificationApplication,
  type VerificationStatus,
} from "@/services/adminVerificationService";

const PAGE_SIZE = 10;

const documentLabels: Record<string, string> = {
  certificate_of_occupancy: "Certificate of Occupancy (C of O)",
  deed_of_assignment: "Deed of Assignment",
  governors_consent: "Governor's Consent",
  land_certificate: "Lagos State Land Certificate",
  land_use_charge: "Lagos Land Use Charge receipt",
  survey_plan: "Registered Survey Plan",
  other_ownership_document: "Other ownership document",
};

const statusStyles: Record<VerificationStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  verified: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not reviewed";

const SummaryDecoration = ({ tone }: { tone: "amber" | "green" | "rose" }) => {
  const colors = {
    amber: "border-amber-200/20 bg-amber-200/10",
    green: "border-emerald-200/20 bg-emerald-200/10",
    rose: "border-rose-200/20 bg-rose-200/10",
  }[tone];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-44 overflow-hidden">
      <span className={`absolute -right-11 -top-12 h-36 w-36 rounded-full border-[26px] ${colors}`} />
      <span className={`absolute -bottom-14 right-8 h-32 w-32 rounded-full border-[24px] ${colors}`} />
    </div>
  );
};

const LandlordVerificationPage = () => {
  const [applications, setApplications] = useState<LandlordVerificationApplication[]>([]);
  const [summaryApplications, setSummaryApplications] = useState<LandlordVerificationApplication[]>([]);
  const [filter, setFilter] = useState<"all" | VerificationStatus>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openingPath, setOpeningPath] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LandlordVerificationApplication | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const [next, all] = await Promise.all([
        adminVerificationService.getApplications(filter === "all" ? undefined : filter),
        filter === "all" ? Promise.resolve(null) : adminVerificationService.getApplications(),
      ]);
      setApplications(next);
      setSummaryApplications(all || next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const counts = useMemo(
    () => ({
      pending: summaryApplications.filter((item) => item.verificationStatus === "pending").length,
      verified: summaryApplications.filter((item) => item.verificationStatus === "verified").length,
      rejected: summaryApplications.filter((item) => item.verificationStatus === "rejected").length,
    }),
    [summaryApplications],
  );

  const matchingApplications = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return applications;
    return applications.filter((application) =>
      [
        application.businessName,
        application.name,
        application.email,
        application.phone,
        application.whatsappNumber,
        application.propertyAddress,
        application.propertyLocalGovernment,
        application.verifiedIdentityName,
      ].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [applications, search]);

  const totalPages = Math.max(1, Math.ceil(matchingApplications.length / PAGE_SIZE));
  const paginatedApplications = matchingApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openPrivateDocument = async (path: string) => {
    const previewWindow = window.open("", "_blank");
    setOpeningPath(path);
    try {
      const url = await adminVerificationService.createDocumentUrl(path);
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      previewWindow?.close();
      toast.error(error instanceof Error ? error.message : "Could not open the document.");
    } finally {
      setOpeningPath(null);
    }
  };

  const review = async (
    application: LandlordVerificationApplication,
    decision: "verified" | "rejected",
  ) => {
    const note = notes[application.userId]?.trim() || "";
    if (decision === "rejected" && !note) {
      toast.error("Enter a clear rejection reason for the applicant.");
      return;
    }
    if (
      decision === "verified" &&
      !window.confirm(`Approve ${application.name} as a verified landlord?`)
    ) {
      return;
    }

    setActionId(application.userId);
    try {
      await adminVerificationService.reviewApplication(
        application.userId,
        decision,
        note || undefined,
      );
      toast.success(
        decision === "verified" ? "Landlord verified." : "Application rejected.",
      );
      await loadApplications();
      setSelectedApplication(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review could not be saved.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-950">Admin review</h2>
          <div className="flex gap-3">
            <select
              aria-label="Filter verification applications"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
              value={filter}
              onChange={(event) => setFilter(event.target.value as "all" | VerificationStatus)}>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="all">All applications</option>
            </select>
            <Button variant="outline" onClick={() => void loadApplications()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="relative overflow-hidden border-[#41614F] bg-[linear-gradient(135deg,#41614F_0%,#4f765f_100%)] text-white shadow-lg shadow-[#41614F]/20 ring-1 ring-white/20">
            <SummaryDecoration tone="amber" />
            <CardContent className="relative z-10 flex items-center gap-4 p-6">
              <span className="rounded-xl bg-amber-300/20 p-3 shadow-inner ring-1 ring-amber-100/20"><Clock3 className="h-7 w-7 text-amber-100" strokeWidth={2} /></span>
              <div><p className="text-2xl font-bold">{counts.pending}</p><p className="text-sm text-white/85">Pending review</p></div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-[#41614F] bg-[linear-gradient(135deg,#41614F_0%,#4f765f_100%)] text-white shadow-lg shadow-[#41614F]/20 ring-1 ring-white/20">
            <SummaryDecoration tone="green" />
            <CardContent className="relative z-10 flex items-center gap-4 p-6">
              <span className="rounded-xl bg-emerald-300/20 p-3 shadow-inner ring-1 ring-emerald-100/20"><BadgeCheck className="h-7 w-7 text-emerald-100" strokeWidth={2} /></span>
              <div><p className="text-2xl font-bold">{counts.verified}</p><p className="text-sm text-white/85">Verified</p></div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border-[#41614F] bg-[linear-gradient(135deg,#41614F_0%,#4f765f_100%)] text-white shadow-lg shadow-[#41614F]/20 ring-1 ring-white/20">
            <SummaryDecoration tone="rose" />
            <CardContent className="relative z-10 flex items-center gap-4 p-6">
              <span className="rounded-xl bg-rose-300/20 p-3 shadow-inner ring-1 ring-rose-100/20"><XCircle className="h-7 w-7 text-rose-100" strokeWidth={2} /></span>
              <div><p className="text-2xl font-bold">{counts.rejected}</p><p className="text-sm text-white/85">Rejected</p></div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#129B36]" /></div>
        ) : applications.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-gray-500">No {filter === "all" ? "" : `${filter} `}applications found.</CardContent></Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-950">Verification applications</h3>
                <p className="text-sm text-gray-500">{matchingApplications.length} application{matchingApplications.length === 1 ? "" : "s"}</p>
              </div>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search landlord, email, phone or LGA"
                className="w-full sm:max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Landlord</th>
                    <th className="px-5 py-4 font-semibold">Contact</th>
                    <th className="px-5 py-4 font-semibold">Verified identity</th>
                    <th className="px-5 py-4 font-semibold">Property</th>
                    <th className="px-5 py-4 font-semibold">Document</th>
                    <th className="px-5 py-4 font-semibold">Submitted</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedApplications.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-500">No applications match your search.</td></tr>
                  ) : paginatedApplications.map((application) => (
                    <tr key={application.userId} className="bg-white hover:bg-gray-50/80">
                      <td className="px-5 py-4"><p className="font-semibold text-gray-950">{application.businessName || application.name}</p><p className="mt-0.5 text-xs text-gray-500">{application.name}</p></td>
                      <td className="px-5 py-4"><p>{application.email}</p><p className="mt-0.5 text-xs text-gray-500">{application.whatsappNumber || application.phone}</p></td>
                      <td className="max-w-52 px-5 py-4"><p className="truncate font-medium">{application.verifiedIdentityName || "Name unavailable"}</p><p className="mt-0.5 text-xs text-gray-500">NIN •••••••{application.ninLastFour}</p></td>
                      <td className="max-w-56 px-5 py-4"><p className="font-medium">{application.propertyLocalGovernment}</p><p className="mt-0.5 truncate text-xs text-gray-500">{application.propertyAddress}</p></td>
                      <td className="max-w-52 px-5 py-4"><p className="truncate">{documentLabels[application.ownershipDocumentType] || application.ownershipDocumentType}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">{formatDate(application.submittedAt)}</td>
                      <td className="px-5 py-4"><Badge variant="outline" className={`capitalize ${statusStyles[application.verificationStatus]}`}>{application.verificationStatus}</Badge></td>
                      <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}><Eye className="h-4 w-4" /> Review</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-500">
                Showing {matchingApplications.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, matchingApplications.length)} of {matchingApplications.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="h-4 w-4" /> Previous</Button>
                <span className="flex items-center px-2 text-xs font-medium text-gray-600">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        )}

        <Dialog open={Boolean(selectedApplication)} onOpenChange={(open) => !open && setSelectedApplication(null)}>
          {selectedApplication && (
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl lg:max-w-6xl">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-3 pr-8">
                  <DialogTitle>{selectedApplication.businessName || selectedApplication.name}</DialogTitle>
                  <Badge variant="outline" className={`capitalize ${statusStyles[selectedApplication.verificationStatus]}`}>{selectedApplication.verificationStatus}</Badge>
                </div>
                <DialogDescription>{selectedApplication.name} · {selectedApplication.email} · {selectedApplication.whatsappNumber || selectedApplication.phone}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 lg:grid-cols-3">
                <section className="rounded-lg border p-4">
                  <h2 className="flex items-center gap-2 font-semibold"><BadgeCheck className="h-5 w-5 text-[#129B36]" />Identity</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div><dt className="text-gray-500">Verified NIN name</dt><dd className="font-medium">{selectedApplication.verifiedIdentityName || "Name unavailable for older submission"}</dd></div>
                    <div><dt className="text-gray-500">NIN</dt><dd className="font-medium">•••••••{selectedApplication.ninLastFour}</dd></div>
                    <div><dt className="text-gray-500">Residential address</dt><dd className="font-medium">{selectedApplication.residentialAddress}, {selectedApplication.localGovernment}, {selectedApplication.state}</dd></div>
                  </dl>
                  <Button variant="outline" className="mt-4 w-full" disabled={openingPath === selectedApplication.identityImagePath} onClick={() => void openPrivateDocument(selectedApplication.identityImagePath)}>
                    {openingPath === selectedApplication.identityImagePath ? <Loader2 className="animate-spin" /> : <ExternalLink />} View identity photo
                  </Button>
                </section>

                <section className="rounded-lg border p-4 lg:col-span-2">
                  <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5 text-[#129B36]" />Ownership evidence</h2>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-gray-500">Document type</dt><dd className="font-medium">{documentLabels[selectedApplication.ownershipDocumentType] || selectedApplication.ownershipDocumentType}</dd></div>
                    <div><dt className="text-gray-500">Property LGA</dt><dd className="font-medium">{selectedApplication.propertyLocalGovernment}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-gray-500">Property address</dt><dd className="font-medium">{selectedApplication.propertyAddress}</dd></div>
                  </dl>
                  <Button variant="outline" className="mt-4" disabled={openingPath === selectedApplication.ownershipDocumentPath} onClick={() => void openPrivateDocument(selectedApplication.ownershipDocumentPath)}>
                    {openingPath === selectedApplication.ownershipDocumentPath ? <Loader2 className="animate-spin" /> : <ExternalLink />} Open ownership document
                  </Button>
                </section>
              </div>

              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
                Confirm that the document type is correct, the owner name matches the verified NIN name, the address/LGA matches, and the title or registration details look genuine. Land Use Charge receipts and survey plans are supporting evidence only.
              </div>

              <div className="space-y-3">
                <Textarea
                  aria-label={`Review note for ${selectedApplication.name}`}
                  placeholder={selectedApplication.verificationStatus === "rejected" ? selectedApplication.verificationNote || "Reason for rejection" : "Internal review note (required when rejecting)"}
                  value={notes[selectedApplication.userId] || ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [selectedApplication.userId]: event.target.value }))}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">Submitted {formatDate(selectedApplication.submittedAt)}{selectedApplication.reviewedAt ? ` · Reviewed ${formatDate(selectedApplication.reviewedAt)} by ${selectedApplication.reviewerName || "administrator"}` : ""}</p>
                  <div className="flex gap-2">
                    <Button variant="destructive" disabled={actionId === selectedApplication.userId} onClick={() => void review(selectedApplication, "rejected")}><XCircle /> Reject</Button>
                    <Button className="bg-[#129B36] hover:bg-[#0e7d2b]" disabled={actionId === selectedApplication.userId} onClick={() => void review(selectedApplication, "verified")}>
                      {actionId === selectedApplication.userId ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Approve
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </main>
  );
};

export default LandlordVerificationPage;
