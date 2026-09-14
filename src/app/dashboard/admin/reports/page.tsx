import { prisma } from "@/lib/prisma";
import { ReportReviewList } from "@/components/report-review-list";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { author: true, reviewedBy: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-steel-100">RAPOR İNCELEME</h1>
        <p className="mt-1 text-sm text-steel-300">
          Gelen kadro raporlarını onayla, revizyona gönder veya reddet.
        </p>
      </div>
      <ReportReviewList initialReports={JSON.parse(JSON.stringify(reports))} />
    </div>
  );
}
