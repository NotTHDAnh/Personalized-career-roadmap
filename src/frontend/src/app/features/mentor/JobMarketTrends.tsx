const BLUE = "#1B365D";

interface Domain {
  name: string;
  pct: number;
  postings: string;
  color: string;
}

const DOMAINS: Domain[] = [
  { name: "Cloud Computing & Infra", pct: 95, postings: "2,450 Postings", color: "#0D9488" },
  { name: "Agentic AI & Orchestration", pct: 88, postings: "2,120 Postings", color: "#7C3AED" },
  { name: "Full-Stack Web Development", pct: 82, postings: "1,980 Postings", color: "#2563EB" },
  { name: "Cybersecurity & Net Defense", pct: 75, postings: "1,650 Postings", color: "#DC2626" },
  { name: "Data Engineering & Pipelines", pct: 68, postings: "1,410 Postings", color: "#D97706" },
  { name: "DevOps & Infrastructure as Code", pct: 60, postings: "1,220 Postings", color: "#059669" },
  { name: "Mobile App Architectures", pct: 52, postings: "980 Postings", color: "#0891B2" },
  { name: "Enterprise ERP Systems", pct: 45, postings: "810 Postings", color: "#9333EA" },
  { name: "UI/UX & Spatial Design", pct: 38, postings: "640 Postings", color: "#E11D48" },
  { name: "Blockchain & FinTech Sec", pct: 30, postings: "450 Postings", color: "#EA580C" },
];

interface Hashtag {
  tag: string;
  rating: "High" | "Medium" | "Low";
}

const HASHTAGS: Hashtag[] = [
  { tag: "#Microservices", rating: "High" },
  { tag: "#AWS_Cloud", rating: "High" },
  { tag: "#RESTful_API", rating: "High" },
  { tag: "#CICD_Pipelines", rating: "Medium" },
  { tag: "#Kubernetes", rating: "Medium" },
  { tag: "#DataAnalytics", rating: "Medium" },
  { tag: "#DockerContainers", rating: "Medium" },
  { tag: "#AgileScrum", rating: "Medium" },
  { tag: "#MachineLearning", rating: "Low" },
  { tag: "#Serverless", rating: "Low" },
];

function RatingBadge({ rating }: { rating: Hashtag["rating"] }) {
  const styles: Record<Hashtag["rating"], React.CSSProperties> = {
    High: { background: "#FEE2E2", color: "#991B1B" },
    Medium: { background: "#FEF3C7", color: "#92400E" },
    Low: { background: "#F1F5F9", color: "#475569" },
  };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs"
      style={{ ...styles[rating], fontWeight: 500 }}
    >
      {rating}
    </span>
  );
}

export default function JobMarketTrends() {
  return (
    <div className="p-8 min-h-full" style={{ background: "#F1F5F9" }}>
      <div className="mb-6">
        <h2 style={{ color: BLUE, fontWeight: 700, fontSize: "1.2rem" }}>
          Job Market Trends
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Live industry demand data · Updated May 2026
        </p>
      </div>

      {/* 50/50 split grid — terminates at bottom edge, no footer */}
      <div className="grid grid-cols-2 gap-5">
        {/* ── Left: Horizontal Bar Chart ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-gray-100"
            style={{ background: "#F8FAFC" }}
          >
            <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
              In-Demand Tech Domains
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">By active vacancy postings</p>
          </div>
          <div className="px-6 py-4 space-y-3.5">
            {DOMAINS.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                    {d.name}
                  </span>
                  <span className="text-xs text-gray-400">{d.postings}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${d.pct}%`, background: d.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Trending Hashtags Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-gray-100"
            style={{ background: "#F8FAFC" }}
          >
            <h3 className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
              Trending Hot Hashtags
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">High-frequency skill keywords</p>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider border-b border-gray-100"
                  style={{ color: "#64748B", fontWeight: 600 }}
                >
                  Trending Hashtag
                </th>
                <th
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider border-b border-gray-100"
                  style={{ color: "#64748B", fontWeight: 600 }}
                >
                  Frequency Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {HASHTAGS.map((h, i) => (
                <tr
                  key={h.tag}
                  className="border-t border-gray-100"
                  style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}
                >
                  <td className="px-6 py-3.5">
                    <span
                      className="text-sm font-mono"
                      style={{ color: BLUE, fontWeight: 500 }}
                    >
                      {h.tag}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <RatingBadge rating={h.rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
