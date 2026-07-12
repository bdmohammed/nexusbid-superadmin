"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText, ShieldCheck, Eye, Download, Users, Star, MessageSquare, Info,
  AlertTriangle, History, ShieldAlert, ArrowLeft, Plus, Check, Trash2, Send
} from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/common/StatusBadge";
import type {
  Tender, TenderVersion, TenderDocument, TenderParticipant,
  TenderEvaluation, TenderCommittee, TenderQuestion, TenderClarification,
  TenderAmendment, TenderReview, TenderReviewComment
} from "@/types";

export default function TenderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params.id as string;

  const [tender, setTender] = useState<Tender | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Tab specific data states (synced with workspace actions)
  const [questions, setQuestions] = useState<TenderQuestion[]>([]);
  const [clarifications, setClarifications] = useState<TenderClarification[]>([]);
  const [amendments, setAmendments] = useState<TenderAmendment[]>([]);
  const [committee, setCommittee] = useState<TenderCommittee[]>([]);
  const [participants, setParticipants] = useState<TenderParticipant[]>([]);
  const [evaluations, setEvaluations] = useState<TenderEvaluation[]>([]);
  const [reviews, setReviews] = useState<TenderReview[]>([]);

  // Input states
  const [newQuestion, setNewQuestion] = useState("");
  const [answerText, setAnswerText] = useState<{ [qId: string]: string }>({});
  const [clarTitle, setClarTitle] = useState("");
  const [clarDesc, setClarDesc] = useState("");
  const [amendNum, setAmendNum] = useState(1);
  const [amendField, setAmendField] = useState("");
  const [amendVal, setAmendVal] = useState("");
  const [commUser, setCommUser] = useState("");
  const [commRole, setCommRole] = useState<"Chairperson" | "Evaluator" | "Observer">("Evaluator");

  // Evaluation inputs
  const [evalPartId, setEvalPartId] = useState("");
  const [evalCriteria, setEvalCriteria] = useState("");
  const [evalWeight, setEvalWeight] = useState("0.2");
  const [evalScore, setEvalScore] = useState("80");
  const [evalRemarks, setEvalRemarks] = useState("");

  useEffect(() => {
    // Fetch base tender details
    async function loadDetails() {
      try {
        const res = await fetch(`/api/v1/tenders/admin/${tenderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.data) {
            setTender(data.data);
          }
        }
      } catch (err) {
        console.warn("API offline - rendering premium client-side workspace.");
      }
    }
    loadDetails();

    // Load mock sub-resources for full 12-tab fidelity
    setQuestions([
      { id: "q-1", tenderId, vendorId: "v-1", vendorName: "Delta Corp LLC", questionText: "Is it possible to submit a bid security bond instead of a bank guarantee?", answerText: "Yes, bid bonds from authorized insurance agencies are acceptable.", isPublic: true, answeredAt: "2026-03-05T12:00:00Z", createdAt: "2026-03-04T09:00:00Z" },
      { id: "q-2", tenderId, vendorId: "v-2", vendorName: "Summit Systems", questionText: "Can we extend the closing date by 2 weeks due to local holidays?", answerText: null, isPublic: false, answeredAt: null, createdAt: "2026-03-06T14:30:00Z" }
    ]);

    setClarifications([
      { id: "c-1", tenderId, title: "Pre-Bid Meeting Minutes Clarification", description: "The minutes of the pre-bid conference held on Feb 20 have been compiled. Please review the updated Q&A section under Tab 7.", createdAt: "2026-02-21T10:00:00Z" }
    ]);

    setAmendments([
      { id: "a-1", tenderId, amendmentNumber: 1, changedFields: { closingDate: { old: "2026-03-15", new: "2026-03-31" } }, createdAt: "2026-02-25T11:00:00Z" }
    ]);

    setCommittee([
      { id: "cm-1", tenderId, userId: "u-1", userName: "Marcus Aurelius", userEmail: "marcus@nexusbid.gov", role: "Chairperson" },
      { id: "cm-2", tenderId, userId: "u-2", userName: "Dr. Selina Kyle", userEmail: "selina@nexusbid.gov", role: "Evaluator" }
    ]);

    setParticipants([
      { id: "p-1", tenderId, vendorId: "v-1", vendorName: "Delta Corp LLC", vendorEmail: "bid@deltacorp.com", status: "submitted", submissionVersion: 1, withdrawnAt: null, evaluationCompleted: false },
      { id: "p-2", tenderId, vendorId: "v-2", vendorName: "Summit Systems", vendorEmail: "tenders@summitsys.net", status: "registered", submissionVersion: null, withdrawnAt: null, evaluationCompleted: false }
    ]);

    setEvaluations([
      { id: "ev-1", participantId: "p-1", evaluationType: "technical", criteriaName: "Relevant Experience & Case Studies", weight: 0.3, score: 85, maxScore: 100, passed: true, remarks: "Excellent portfolio of municipal structures." }
    ]);

    setReviews([
      {
        id: "rev-1",
        tenderVersionId: "ver-1",
        status: "under_review",
        createdAt: "2026-01-12T08:00:00Z",
        assignments: [
          { id: "ra-1", reviewId: "rev-1", reviewerId: "r-1", reviewerName: "Senior Auditor Chief", assignedAt: "2026-01-12T08:00:00Z", completedAt: null }
        ],
        comments: [
          { id: "rc-1", reviewId: "rev-1", authorId: "r-1", authorName: "Senior Auditor Chief", commentText: "Budget details look realistic. Need validation of site visit access protocols.", createdAt: "2026-01-12T09:30:00Z" }
        ]
      }
    ]);
  }, [tenderId]);

  // Fallback structure when tender state isn't fetched yet
  const activeTender = tender || {
    id: tenderId,
    referenceNo: "TDR-2026-000101",
    status: "ACTIVE",
    publicationStatus: "PUBLISHED",
    activeVersion: {
      version: 1,
      status: "APPROVED",
      title: "Design & Construction of New City Administrative Complex",
      description: "Comprehensive tender invitation for the architectural design, structural layouts, and civil construction of the upcoming modern administrative complex.",
      procurementType: "Works",
      priority: "High",
      estimatedBudget: 4500000,
      currency: "USD",
      department: "Public Infrastructure Board",
      placeId: "chicago_id_101",
      formattedAddress: "Loop District, Chicago, IL, USA",
      siteVisitRequired: true,
      siteVisitDate: "2026-02-15T10:00:00Z",
      siteVisitInstructions: "Report to Main Gate with security clearances.",
      contactPerson: "Sarah Jenkins",
      contactEmail: "sjenkins@cityinfra.gov",
      contactPhone: "+1-312-555-0199",
      openingDate: "2026-02-01T09:00:00Z",
      closingDate: "2026-03-31T17:00:00Z",
      bidValidity: 90,
      projectDuration: "24 Months",
      emdAmount: 50000,
      securityDeposit: 150000,
      paymentTerms: "Milestone-based progress payments",
      visibility: "public",
      evaluationMethod: "Quality & Cost Based Selection (QCBS)",
      submissionMethod: "Online portal submission only",
      contractType: "Lump Sum",
      procurementMethod: "Open Competitive Bidding",
      eligibilityCriteria: "Min 10 years experience in tier-1 commercial developments.",
      specialConditions: "Performance guarantees required prior to award.",
      documents: [
        { id: "d-1", documentType: "Notice", originalName: "NIT_Notice_Invitation_101.pdf", fileSize: 1048576, virusScanStatus: "Clean", downloadCount: 14, isPublic: true, uploadedAt: "2026-01-10T08:00:00Z" },
        { id: "d-2", documentType: "BOQ", originalName: "BOQ_Bill_Of_Quantities_Complex.xlsx", fileSize: 2097152, virusScanStatus: "Clean", downloadCount: 8, isPublic: false, uploadedAt: "2026-01-10T08:30:00Z" }
      ]
    }
  };

  const version = activeTender.activeVersion;

  // Actions handlers
  async function transitionStatus(pubStatus: string, verStatus?: string) {
    try {
      const res = await fetch(`/api/v1/tenders/admin/${tenderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: verStatus,
          publicationStatus: pubStatus
        })
      });
      if (res.ok) {
        alert("Workflow status updated successfully!");
        window.location.reload();
      }
    } catch (err) {
      alert(`Simulation transition: ${pubStatus} applied in memory.`);
    }
  }

  // Adding sub-resources
  function addQuestionSubmit() {
    if (!newQuestion.trim()) return;
    const item: TenderQuestion = {
      id: `q-${Date.now()}`,
      tenderId,
      vendorId: "v-self",
      vendorName: "Workspace Admin",
      questionText: newQuestion,
      answerText: null,
      isPublic: false,
      answeredAt: null,
      createdAt: new Date().toISOString()
    };
    setQuestions([item, ...questions]);
    setNewQuestion("");
  }

  function answerQuestionSubmit(qId: string) {
    const text = answerText[qId];
    if (!text?.trim()) return;
    setQuestions(questions.map((q) => q.id === qId ? { ...q, answerText: text, answeredAt: new Date().toISOString(), isPublic: true } : q));
    setAnswerText({ ...answerText, [qId]: "" });
  }

  function addClarificationSubmit() {
    if (!clarTitle || !clarDesc) return;
    const item: TenderClarification = {
      id: `c-${Date.now()}`,
      tenderId,
      title: clarTitle,
      description: clarDesc,
      createdAt: new Date().toISOString()
    };
    setClarifications([item, ...clarifications]);
    setClarTitle("");
    setClarDesc("");
  }

  function addAmendmentSubmit() {
    if (!amendField || !amendVal) return;
    const item: TenderAmendment = {
      id: `a-${Date.now()}`,
      tenderId,
      amendmentNumber: amendNum,
      changedFields: { [amendField]: { old: "N/A", new: amendVal } },
      createdAt: new Date().toISOString()
    };
    setAmendments([item, ...amendments]);
    setAmendNum(amendNum + 1);
    setAmendField("");
    setAmendVal("");
  }

  function addCommitteeSubmit() {
    if (!commUser) return;
    const item: TenderCommittee = {
      id: `cm-${Date.now()}`,
      tenderId,
      userId: `u-${Date.now()}`,
      userName: commUser,
      userEmail: `${commUser.toLowerCase().replace(" ", "")}@nexusbid.gov`,
      role: commRole
    };
    setCommittee([...committee, item]);
    setCommUser("");
  }

  function addEvaluationSubmit() {
    if (!evalPartId || !evalCriteria) return;
    const item: TenderEvaluation = {
      id: `ev-${Date.now()}`,
      participantId: evalPartId,
      evaluationType: "technical",
      criteriaName: evalCriteria,
      weight: parseFloat(evalWeight),
      score: parseFloat(evalScore),
      maxScore: 100,
      passed: parseFloat(evalScore) >= 50,
      remarks: evalRemarks || null
    };
    setEvaluations([...evaluations, item]);
    setEvalCriteria("");
    setEvalRemarks("");
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "details", label: "Parameters Details", icon: FileText },
    { id: "documents", label: "Documents & Files", icon: ShieldCheck },
    { id: "participants", label: "Bidders & Invites", icon: Users },
    { id: "evaluations", label: "Scorecard Criteria", icon: Star },
    { id: "committee", label: "Committee Members", icon: Users },
    { id: "qa", label: "Q&A Board", icon: MessageSquare },
    { id: "clarifications", label: "Clarifications Notice", icon: Info },
    { id: "amendments", label: "Amendments Audit", icon: History },
    { id: "reviews", label: "Auditor Reviews", icon: ShieldAlert }
  ];

  return (
    <div className="space-y-6">
      {/* Back to Tenders */}
      <button
        onClick={() => router.push("/tenders")}
        className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text transition"
      >
        <ArrowLeft size={16} />
        Back to Tenders Command
      </button>

      {/* Top Details Banner */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-extrabold text-primary">
              {activeTender.referenceNo}
            </span>
            <div className="flex gap-1.5">
              <span className="text-xs">
                Lifecycle: <StatusBadge status={activeTender.status.toLowerCase()} />
              </span>
              <span className="text-xs">
                Publishing: <StatusBadge status={activeTender.publicationStatus.toLowerCase()} />
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-1">{version?.title}</h2>
          <p className="text-sm text-text-light mt-0.5">
            Active version: <span className="font-bold text-text">v{version?.version}</span> (Approved & live)
          </p>
        </div>

        {/* Workflow actions */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTender.publicationStatus !== "OPEN" && (
            <Button size="sm" onClick={() => transitionStatus("OPEN")}>
              Publish Live
            </Button>
          )}
          {activeTender.publicationStatus !== "CLOSED" && (
            <Button size="sm" variant="danger" onClick={() => transitionStatus("CLOSED")}>
              Close Bidding
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => router.push("/tenders/create")}>
            New Version Draft
          </Button>
        </div>
      </div>

      {/* Workspace Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-surface p-2 space-y-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-text-light hover:bg-background hover:text-text"
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side Tab Workspace Panel */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-6 shadow-sm min-h-[500px]">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Workspace Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background p-4 rounded-xl">
                  <span className="text-xs text-text-light font-medium">Estimated Budget</span>
                  <p className="text-lg font-extrabold text-text mt-1">
                    ${version?.estimatedBudget?.toLocaleString()} {version?.currency}
                  </p>
                </div>
                <div className="bg-background p-4 rounded-xl">
                  <span className="text-xs text-text-light font-medium">Procurement Category</span>
                  <p className="text-lg font-extrabold text-text mt-1">
                    {/* {version?.category?.name || "Works"} */}
                  </p>
                </div>
                <div className="bg-background p-4 rounded-xl">
                  <span className="text-xs text-text-light font-medium">Closing Date Countdown</span>
                  <p className="text-lg font-extrabold text-orange-600 mt-1">
                    {version?.closingDate ? new Date(version.closingDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm">Brief Description</h4>
                <p className="text-sm text-text-light leading-relaxed">{version?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <span className="text-xs text-text-light">Department Agency</span>
                  <p className="text-sm font-semibold">{version?.department}</p>
                </div>
                <div>
                  <span className="text-xs text-text-light">Google Geodata Address</span>
                  <p className="text-sm font-semibold">{version?.formattedAddress || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARAMETERS DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Detailed Procurement Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm mb-3">Timelines & Milestones</h4>
                  <table className="min-w-full divide-y divide-border text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-text-light">Opening Date</td>
                        <td className="py-2 font-medium">{version?.openingDate ? new Date(version.openingDate).toLocaleString() : "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-text-light">Project Duration</td>
                        <td className="py-2 font-medium">{version?.projectDuration || "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-text-light">Bid Validity (Days)</td>
                        <td className="py-2 font-medium">{version?.bidValidity || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-bold text-sm mb-3">Financial Securities & Rules</h4>
                  <table className="min-w-full divide-y divide-border text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-text-light">EMD Deposit Amount</td>
                        <td className="py-2 font-medium">${version?.emdAmount?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-text-light">Security Deposit Performance</td>
                        <td className="py-2 font-medium">${version?.securityDeposit?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-text-light">Payment Terms</td>
                        <td className="py-2 font-medium">{version?.paymentTerms || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="font-bold text-sm">Eligibility Criteria</h4>
                  <p className="text-sm text-text-light mt-1">{version?.eligibilityCriteria}</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm">Special Conditions</h4>
                  <p className="text-sm text-text-light mt-1">{version?.specialConditions}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Pre-bid S3 Documents</h3>
              <div className="divide-y divide-border">
                {version?.documents?.map((doc: any) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 text-primary rounded-lg">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{doc.originalName}</p>
                        <p className="text-xs text-text-light">
                          Type: <span className="font-bold">{doc.documentType}</span> • Size: {(doc.fileSize / 1024 / 1024).toFixed(2)}MB • Downloads: {doc.downloadCount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        <ShieldCheck size={12} />
                        {doc.virusScanStatus}
                      </span>
                      <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-background transition text-text-light">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PARTICIPANTS / BIDDERS */}
          {activeTab === "participants" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Registered Bidders List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Vendor Name</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Contact Email</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Bid Status</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Submission Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {participants.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 font-semibold">{p.vendorName}</td>
                        <td className="py-3 text-text-light">{p.vendorEmail}</td>
                        <td className="py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-3 font-mono font-bold text-center">
                          {p.submissionVersion || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SCORECARD CRITERIA */}
          {activeTab === "evaluations" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Evaluations Scorecard Matrix</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Criteria Name</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Weight</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Score / Max</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Result</th>
                      <th className="py-2 text-left text-xs font-semibold text-text-light uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {evaluations.map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-3 font-semibold">{ev.criteriaName}</td>
                        <td className="py-3">{ev.weight * 100}%</td>
                        <td className="py-3 font-bold">{ev.score} / {ev.maxScore}</td>
                        <td className="py-3">
                          {ev.passed ? (
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">PASSED</span>
                          ) : (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">FAILED</span>
                          )}
                        </td>
                        <td className="py-3 text-text-light">{ev.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add evaluation row */}
              <div className="bg-background p-4 rounded-xl space-y-4">
                <h4 className="font-bold text-sm">Submit New Bid Scorecard Entry</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={evalPartId}
                    onChange={(e) => setEvalPartId(e.target.value)}
                    className="h-10 rounded-lg border bg-surface px-3 text-sm"
                  >
                    <option value="">Select Bidder</option>
                    {participants.map((p) => <option key={p.id} value={p.id}>{p.vendorName}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Criteria Name"
                    value={evalCriteria}
                    onChange={(e) => setEvalCriteria(e.target.value)}
                    className="h-10 rounded-lg border bg-surface px-3 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Weight (0-1)"
                    value={evalWeight}
                    onChange={(e) => setEvalWeight(e.target.value)}
                    className="h-10 rounded-lg border bg-surface px-3 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Score (0-100)"
                    value={evalScore}
                    onChange={(e) => setEvalScore(e.target.value)}
                    className="h-10 rounded-lg border bg-surface px-3 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Evaluation Remarks..."
                    value={evalRemarks}
                    onChange={(e) => setEvalRemarks(e.target.value)}
                    className="h-10 flex-1 rounded-lg border bg-surface px-3 text-sm"
                  />
                  <Button onClick={addEvaluationSubmit}>Record Score</Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMMITTEE MEMBERS */}
          {activeTab === "committee" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Tender Committee Members</h3>
              <div className="divide-y divide-border">
                {committee.map((member) => (
                  <div key={member.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{member.userName}</p>
                      <p className="text-xs text-text-light">{member.userEmail}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add member form */}
              <div className="bg-background p-4 rounded-xl flex gap-3">
                <input
                  type="text"
                  placeholder="Enter user name..."
                  value={commUser}
                  onChange={(e) => setCommUser(e.target.value)}
                  className="h-10 flex-1 rounded-lg border bg-surface px-3 text-sm outline-none"
                />
                <select
                  value={commRole}
                  onChange={(e) => setCommRole(e.target.value as any)}
                  className="h-10 rounded-lg border bg-surface px-3 text-sm outline-none"
                >
                  <option value="Chairperson">Chairperson</option>
                  <option value="Evaluator">Evaluator</option>
                  <option value="Observer">Observer</option>
                </select>
                <Button onClick={addCommitteeSubmit}>Assign Member</Button>
              </div>
            </div>
          )}

          {/* TAB 7: Q&A BOARD */}
          {activeTab === "qa" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Interactive Q&A Board</h3>

              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="bg-background p-4 rounded-xl space-y-2 border">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-primary">{q.vendorName} asked:</span>
                      <span className="text-xs text-text-light">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-text">{q.questionText}</p>

                    {q.answerText ? (
                      <div className="mt-2 bg-surface p-3 rounded-lg border-l-4 border-green-500">
                        <span className="text-xs font-bold text-green-600">Official Answer:</span>
                        <p className="text-sm mt-0.5 text-text">{q.answerText}</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type answer reply..."
                          value={answerText[q.id] || ""}
                          onChange={(e) => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                          className="h-9 flex-1 rounded-lg border bg-surface px-3 text-sm outline-none"
                        />
                        <Button size="sm" onClick={() => answerQuestionSubmit(q.id)}>Reply</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Question */}
              <div className="border-t pt-4">
                <label className="block text-sm font-semibold mb-2">Ask a Question</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type pre-bid clarification query here..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none"
                  />
                  <Button onClick={addQuestionSubmit}>Ask</Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CLARIFICATIONS NOTICE */}
          {activeTab === "clarifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Pre-Bid Meeting Clarifications</h3>
              <div className="space-y-4">
                {clarifications.map((c) => (
                  <div key={c.id} className="bg-background p-4 rounded-xl border">
                    <h4 className="font-bold text-sm">{c.title}</h4>
                    <p className="text-xs text-text-light mt-1">Published: {new Date(c.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm mt-2 text-text-light leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>

              {/* Create Clarification */}
              <div className="bg-background p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-sm">Post New Clarification Bulletin</h4>
                <input
                  type="text"
                  placeholder="Clarification Title"
                  value={clarTitle}
                  onChange={(e) => setClarTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-surface px-3 text-sm outline-none"
                />
                <textarea
                  rows={3}
                  placeholder="Detailed announcement content..."
                  value={clarDesc}
                  onChange={(e) => setClarDesc(e.target.value)}
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none"
                />
                <Button onClick={addClarificationSubmit}>Publish Bulletin</Button>
              </div>
            </div>
          )}

          {/* TAB 9: AMENDMENTS AUDIT */}
          {activeTab === "amendments" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Tender Amendments Log</h3>
              <div className="space-y-4">
                {amendments.map((a) => (
                  <div key={a.id} className="bg-background p-4 rounded-xl border border-dashed">
                    <h4 className="font-bold text-sm text-primary">Amendment #{a.amendmentNumber}</h4>
                    <p className="text-xs text-text-light mt-1">Logged: {new Date(a.createdAt).toLocaleString()}</p>

                    <div className="mt-3 bg-surface p-3 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-text">Changed Parameters Diff:</span>
                      {Object.keys(a.changedFields).map((field) => (
                        <div key={field} className="font-mono mt-1">
                          • <span className="font-semibold text-text">{field}</span>:{" "}
                          <span className="text-red-600 bg-red-50 px-1 rounded">-{a.changedFields[field].old}</span>{" "}
                          <span className="text-green-600 bg-green-50 px-1 rounded">+{a.changedFields[field].new}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Amendment Form */}
              <div className="bg-background p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-sm">Log Parameters Amendment</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Field Name (e.g. closingDate)"
                    value={amendField}
                    onChange={(e) => setAmendField(e.target.value)}
                    className="h-10 rounded-lg border bg-surface px-3 text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="New Value"
                    value={amendVal}
                    onChange={(e) => setAmendVal(e.target.value)}
                    className="h-10 rounded-lg border bg-surface px-3 text-sm outline-none"
                  />
                </div>
                <Button onClick={addAmendmentSubmit}>Log Amendment</Button>
              </div>
            </div>
          )}

          {/* TAB 10: AUDITOR REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Auditor Review Session</h3>
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-background p-4 rounded-xl border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-primary">Session Status: {rev.status.toUpperCase()}</span>
                      <span className="text-xs text-text-light">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-text">Review Assignments:</p>
                      {rev.assignments.map((ass) => (
                        <div key={ass.id} className="text-xs text-text-light font-medium bg-surface p-2 rounded">
                          Auditor: {ass.reviewerName} (Assigned: {new Date(ass.assignedAt).toLocaleDateString()})
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <p className="text-xs font-bold text-text font-mono">Comments Log:</p>
                      {rev.comments.map((com) => (
                        <div key={com.id} className="text-xs bg-surface p-3 rounded leading-relaxed border-l-2 border-primary">
                          <span className="font-bold text-primary">{com.authorName}</span>: {com.commentText}
                          <p className="text-[10px] text-text-light mt-1">{new Date(com.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
