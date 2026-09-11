import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  BadgeCheck,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  adminVerificationService,
  type LandlordVerificationApplication,
  type VerificationStatus,
} from "@/services/adminVerificationService";

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

const LandlordVerificationPage = () => {
  const [applications, setApplications] = useState<LandlordVerificationApplication[]>([]);
  const [filter, setFilter] = useState<"all" | VerificationStatus>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const next = await adminVerificationService.getApplications(
        filter === "all" ? undefined : filter,
      );
      setApplications(next);
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
      pending: applications.filter((item) => item.verificationStatus === "pending").length,
      verified: applications.filter((item) => item.verificationStatus === "verified").length,
      rejected: applications.filter((item) => item.verificationStatus === "rejected").length,
    }),
    [applications],
  );

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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review could not be saved.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#129B36]">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">Admin review</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-950">Landlord verification</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Match the verified identity, property details and uploaded title document before deciding.
            </p>
          </div>
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
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Pending review</p><p className="mt-1 text-3xl font-bold text-amber-600">{filter === "all" ? counts.pending : filter === "pending" ? applications.length : "—"}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Verified</p><p className="mt-1 text-3xl font-bold text-green-600">{filter === "all" ? counts.verified : filter === "verified" ? applications.length : "—"}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Rejected</p><p className="mt-1 text-3xl font-bold text-red-600">{filter === "all" ? counts.rejected : filter === "rejected" ? applications.length : "—"}</p></CardContent></Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#129B36]" /></div>
        ) : applications.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-gray-500">No {filter === "all" ? "" : `${filter} `}applications found.</CardContent></Card>
        ) : (
          <div className="space-y-5">
            {applications.map((application) => (
              <Card key={application.userId} className="overflow-hidden">
                <CardHeader className="border-b bg-white">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{application.businessName || application.name}</CardTitle>
                      <p className="mt-1 text-sm text-gray-500">{application.name} · {application.email} · {application.whatsappNumber || application.phone}</p>
                    </div>
                    <Badge variant="outline" className={`capitalize ${statusStyles[application.verificationStatus]}`}>{application.verificationStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid gap-5 lg:grid-cols-3">
                    <section className="rounded-lg border p-4">
                      <h2 className="flex items-center gap-2 font-semibold"><BadgeCheck className="h-5 w-5 text-[#129B36]" />Identity</h2>
                      <dl className="mt-3 space-y-2 text-sm">
                        <div><dt className="text-gray-500">Verified NIN name</dt><dd className="font-medium">{application.verifiedIdentityName || "Name unavailable for older submission"}</dd></div>
                        <div><dt className="text-gray-500">NIN</dt><dd className="font-medium">•••••••{application.ninLastFour}</dd></div>
                        <div><dt className="text-gray-500">Residential address</dt><dd className="font-medium">{application.residentialAddress}, {application.localGovernment}, {application.state}</dd></div>
                      </dl>
                      <Button variant="outline" className="mt-4 w-full" disabled={openingPath === application.identityImagePath} onClick={() => void openPrivateDocument(application.identityImagePath)}>
                        {openingPath === application.identityImagePath ? <Loader2 className="animate-spin" /> : <ExternalLink />} View identity photo
                      </Button>
                    </section>

                    <section className="rounded-lg border p-4 lg:col-span-2">
                      <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-5 w-5 text-[#129B36]" />Ownership evidence</h2>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div><dt className="text-gray-500">Document type</dt><dd className="font-medium">{documentLabels[application.ownershipDocumentType] || application.ownershipDocumentType}</dd></div>
                        <div><dt className="text-gray-500">Property LGA</dt><dd className="font-medium">{application.propertyLocalGovernment}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-gray-500">Property address</dt><dd className="font-medium">{application.propertyAddress}</dd></div>
                      </dl>
                      <Button variant="outline" className="mt-4" disabled={openingPath === application.ownershipDocumentPath} onClick={() => void openPrivateDocument(application.ownershipDocumentPath)}>
                        {openingPath === application.ownershipDocumentPath ? <Loader2 className="animate-spin" /> : <ExternalLink />} Open ownership document
                      </Button>
                    </section>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
                    Confirm that the document type is correct, the owner name matches the verified NIN name, the address/LGA matches, and the title or registration details look genuine. Land Use Charge receipts and survey plans are supporting evidence only.
                  </div>

                  <div className="space-y-3">
                    <Textarea
                      aria-label={`Review note for ${application.name}`}
                      placeholder={application.verificationStatus === "rejected" ? application.verificationNote || "Reason for rejection" : "Internal review note (required when rejecting)"}
                      value={notes[application.userId] || ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [application.userId]: event.target.value }))}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-gray-500">Submitted {formatDate(application.submittedAt)}{application.reviewedAt ? ` · Reviewed ${formatDate(application.reviewedAt)} by ${application.reviewerName || "administrator"}` : ""}</p>
                      <div className="flex gap-2">
                        <Button variant="destructive" disabled={actionId === application.userId} onClick={() => void review(application, "rejected")}><XCircle /> Reject</Button>
                        <Button className="bg-[#129B36] hover:bg-[#0e7d2b]" disabled={actionId === application.userId} onClick={() => void review(application, "verified")}>
                          {actionId === application.userId ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default LandlordVerificationPage;
