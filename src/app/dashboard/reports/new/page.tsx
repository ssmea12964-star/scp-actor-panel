import { ReportForm } from "@/components/report-form";

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-steel-100">YENİ RAPOR</h1>
        <p className="mt-1 text-sm text-steel-300">
          Deneme Aktör dahil tüm kadro rapor gönderebilir.
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
