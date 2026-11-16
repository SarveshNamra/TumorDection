const Section = ({ title, children }) => (
  <section className="border border-gray-200 rounded-lg p-4">
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{children}</p>
  </section>
);

const ReportView = ({ report }) => {
  if (!report) return null;

  const scanRef = report.scanId ? report.scanId.slice(0, 8) : null;

  return (
    <article>
      <header className="mb-5">
        <h2 id="report-title" className="text-lg font-semibold text-gray-900">
          AI-Assisted Scan Report
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {scanRef && <>Scan ref: {scanRef} &middot; </>}
          Created {new Date(report.createdAt).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Generated from the VGG16 model prediction and the supplied patient context. The MRI image
          itself was not examined by the report-generation service.
        </p>
      </header>

      <div className="space-y-4">
        <Section title="Findings">{report.findings}</Section>
        <Section title="Impression">{report.impression}</Section>
        <Section title="Recommendations">{report.recommendations}</Section>
      </div>

      {report.disclaimer && (
        <aside
          role="note"
          className="mt-5 bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 leading-relaxed"
        >
          <p className="font-semibold mb-1">Disclaimer</p>
          <p>{report.disclaimer}</p>
        </aside>
      )}
    </article>
  );
};

export default ReportView;