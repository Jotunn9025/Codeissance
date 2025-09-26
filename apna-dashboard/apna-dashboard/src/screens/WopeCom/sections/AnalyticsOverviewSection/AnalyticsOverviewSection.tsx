import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { Checkbox } from "../../../../components/ui/checkbox";

// Custom table components with explicit types
import { ReactNode, HTMLAttributes } from "react";
type TableProps = HTMLAttributes<HTMLTableElement> & { children: ReactNode };
type TableSectionProps = HTMLAttributes<HTMLTableSectionElement> & {
  children: ReactNode;
};
type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
  className?: string;
};
type TableCellProps = HTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  className?: string;
};

const Table = ({ children, ...props }: TableProps) => (
  <table className="w-full text-sm" {...props}>
    {children}
  </table>
);
const TableHeader = ({ children, ...props }: TableSectionProps) => (
  <thead {...props}>{children}</thead>
);
const TableBody = ({ children, ...props }: TableSectionProps) => (
  <tbody {...props}>{children}</tbody>
);
const TableRow = ({ children, className = "", ...props }: TableRowProps) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);
const TableHead = ({ children, className = "", ...props }: TableCellProps) => (
  <th className={`px-4 py-3 text-left font-medium ${className}`} {...props}>
    {children}
  </th>
);
const TableCell = ({ children, className = "", ...props }: TableCellProps) => (
  <td className={`px-4 py-3 ${className}`} {...props}>
    {children}
  </td>
);

const dataSources = [
  {
    name: "twitter.com",
    logo: "/logo-twitter-png.png",
    opacity: "opacity-70",
  },
  {
    name: "reddit.com",
    logo: "/logo-reddit-png.png",
    opacity: "",
    border: true,
  },
  {
    name: "linkedin.com",
    logo: "/logo-linkedin-png.png",
    opacity: "opacity-70",
  },
  { name: "youtube.com", logo: "/logo-youtube-png.png", opacity: "opacity-70" },
  {
    name: "facebook.com",
    logo: "/logo-facebook-png.png",
    opacity: "",
    border: true,
  },
  {
    name: "instagram.com",
    logo: "/logo-instagram-png.png",
    opacity: "opacity-70",
  },
  { name: "tiktok.com", logo: "/logo-tiktok-png.png", opacity: "opacity-70" },
  {
    name: "discord.com",
    logo: "/logo-discord-png.png",
    opacity: "",
    border: true,
  },
  {
    name: "newsapi.org",
    logo: "/logo-newsapi-png.png",
    opacity: "opacity-70",
  },
  {
    name: "forums.data",
    logo: "/logo-forums-png.png",
    opacity: "",
    border: true,
  },
];

const sentimentTopics = [
  {
    topic: "AI Technology",
    sentiment: "Positive",
    confidence: "94%",
    volume: "34M",
  },
  {
    topic: "Climate Change",
    sentiment: "Mixed",
    confidence: "87%",
    volume: "450K",
  },
  {
    topic: "Remote Work",
    sentiment: "Optimistic",
    confidence: "91%",
    volume: "15M",
  },
  {
    topic: "Electric Vehicles",
    sentiment: "Bullish",
    confidence: "88%",
    volume: "27M",
  },
  {
    topic: "Social Media Privacy",
    sentiment: "Negative",
    confidence: "85%",
    volume: "23M",
  },
  {
    topic: "Healthcare Tech",
    sentiment: "Positive",
    confidence: "92%",
    volume: "15M",
  },
  {
    topic: "Education Reform",
    sentiment: "Cautious",
    confidence: "79%",
    volume: "12M",
  },
];

const trendPredictions = [
  {
    trend: "AI Adoption",
    prediction: "Accelerating",
    confidence: "89%",
    impact: "High",
    timeframe: "Next 30d",
    signals: "850",
  },
  {
    trend: "Sustainability Focus",
    prediction: "Growing",
    confidence: "82%",
    impact: "Medium",
    timeframe: "Next 60d",
    signals: "624",
  },
  {
    trend: "Digital Privacy",
    prediction: "Critical",
    confidence: "94%",
    impact: "High",
    timeframe: "Next 14d",
    signals: "1.2K",
  },
  {
    trend: "Work From Home",
    prediction: "Stabilizing",
    confidence: "76%",
    impact: "Medium",
    timeframe: "Next 90d",
    signals: "543",
  },
  {
    trend: "Health Tech",
    prediction: "Expanding",
    confidence: "88%",
    impact: "High",
    timeframe: "Next 45d",
    signals: "721",
  },
  {
    trend: "E-commerce Growth",
    prediction: "Moderate",
    confidence: "73%",
    impact: "Medium",
    timeframe: "Next 30d",
    signals: "456",
  },
  {
    trend: "Green Energy",
    prediction: "Surging",
    confidence: "91%",
    impact: "High",
    timeframe: "Next 120d",
    signals: "987",
  },
];

export const AnalyticsOverviewSection = (): JSX.Element => {
  return (
    <section className="relative w-full py-24 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(113,61,255,0.08)_0%,rgba(113,61,255,0)_100%)] overflow-hidden">
      {/* Decorative backgrounds */}
      <img
        className="absolute w-[calc(100%_-_312px)] top-0 left-[156px] h-14"
        alt="Decoration"
        src="/div-creating-project-customers-inner.svg"
      />
      <img
        className="absolute top-[60px] left-0 w-full h-[582px]"
        alt="Background"
        src="/div-creating-project-background.svg"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-12 max-w-[1128px] mx-auto">
          {/* Headline */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="space-y-4">
              <h1 className="text-[56px] leading-[64px] font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                Autonomous Sentiment.
              </h1>
              <h2 className="text-[56px] leading-[64px] font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                Intelligence Platform
              </h2>
            </div>
            <div className="max-w-[620px] mt-6">
              <p className="text-[#9b96b0] text-xl font-normal leading-7 tracking-[-0.20px]">
                Advanced AI-powered sentiment analysis with autonomous data
                collection, <br />
                time-series ML models, and proactive strategy recommendations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Left / main card */}
            <Card className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-[rgba(169,163,194,0.2)] to-[rgba(169,163,194,0.05)] border-0">
              <CardContent className="p-0 rounded-2xl bg-[linear-gradient(180deg,rgba(11,2,23,0)_23%,rgba(22,9,42,0.2)_100%),linear-gradient(0deg,rgba(10,1,24,1),rgba(10,1,24,1))]">
                <img
                  className="w-full h-[344px] rounded-t-2xl object-cover"
                  alt="Hero Visual"
                  src="/div-lazy-background-image-mask-group-2.svg"
                />
                <div className="p-8 text-center">
                  <h3 className="text-[28px] leading-9 font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                    Real-Time Processing
                  </h3>
                  <p className="text-[#9b96b0] text-base leading-6 tracking-[-0.16px]">
                    Autonomous data collection and processing <br />
                    from social media, news, and forums via APIs
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data sources card */}
            <Card className="rounded-2xl bg-gradient-to-b from-[rgba(169,163,194,0.2)] to-[rgba(169,163,194,0.05)] border-0">
              <CardContent
                className="p-0 rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: `
            linear-gradient(180deg, rgba(11,2,23,0) 23%, rgba(22,9,42,0.2) 100%),
            linear-gradient(0deg, rgba(10,1,24,1), rgba(10,1,24,1))
          `,
                }}
              >
                <div className="relative h-[348px] overflow-hidden">
                  <div className="absolute inset-0 p-6 space-y-3">
                    {[0, 1, 2, 3].map((row) => {
                      const sliceStart = row * 3;
                      return (
                        <div key={row} className="flex flex-wrap gap-1.5">
                          {dataSources
                            .slice(sliceStart, sliceStart + 3)
                            .map((source, idx) => (
                              <Badge
                                key={`${row}-${idx}`}
                                variant="secondary"
                                className={`
                        gap-1.5 pl-1.5 pr-2.5 py-1 bg-[#ffffff1a]
                        rounded-full text-white text-sm
                        ${source.opacity || ""} 
                        ${
                          source.border
                            ? "border border-solid border-white/20"
                            : ""
                        }
                      `}
                              >
                                <div
                                  className="w-5 h-5 bg-cover bg-center rounded-full"
                                  style={{
                                    backgroundImage: `url(${source.logo})`,
                                    backgroundColor: "#ffffff20",
                                  }}
                                />
                                <span className="font-normal tracking-[-0.14px] leading-6">
                                  {source.name}
                                </span>
                              </Badge>
                            ))}
                        </div>
                      );
                    })}
                  </div>

                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Mask Overlay"
                    src="/pseudo-mask-group-2.svg"
                  />

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[rgba(10,1,24,1)] to-transparent">
                    <div className="flex items-center gap-2 pt-4">
                      <span className="text-base bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                        Processing:
                      </span>
                      <Badge
                        variant="secondary"
                        className="gap-1 pl-1 pr-2.5 py-1 bg-[#ffffff1a] rounded-full border border-solid border-white/20 text-white text-sm"
                      >
                        <div
                          className="w-6 h-6 bg-cover bg-center rounded-full "
                          style={{
                            backgroundImage: "url(/logo-api-png.png)",
                            backgroundColor: "#ffffff20",
                          }}
                        />
                        <span className="font-normal tracking-[-0.14px] leading-6">
                          Live APIs
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-8 text-center">
                  <h3 className="text-[28px] leading-9 font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                    Time-Series ML Models
                  </h3>
                  <p className="text-[#9b96b0] text-base leading-6 tracking-[-0.16px]">
                    Predict evolving sentiment trends with <br />
                    historical + real-time data analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom section: sentiment analysis and trend predictions */}
          <Card className="w-full rounded-2xl bg-gradient-to-b from-[rgba(169,163,194,0.2)] to-[rgba(169,163,194,0.05)] border-0">
            <CardContent className="p-0 rounded-2xl bg-[linear-gradient(180deg,rgba(11,2,23,0)_23%,rgba(22,9,42,0.2)_100%),linear-gradient(0deg,rgba(10,1,24,1),rgba(10,1,24,1))]">
              <img
                className="w-full h-[464px] rounded-t-2xl object-cover"
                alt="Background"
                src="/div-lazy-background-image-mask-group-1.svg"
              />

              <div className="relative p-8">
                <img
                  className="absolute w-full left-0 bottom-[-90px] h-[456px] object-contain"
                  alt="Overlay graphic"
                  src="/div-creating-project-box-genius-table-border-wrapper-mask-group.svg"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                  {/* Sentiment analysis table */}
                  <Card className="bg-[#ffffff0a] border border-white/20 rounded overflow-hidden">
                    <div className="bg-[#ffffff0a] border-b border-white/20 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img className="w-5 h-5" alt="Icon" src="/svg-18.svg" />
                        <span className="text-white text-sm font-normal">
                          Sentiment Analysis
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5">
                        <img className="w-5 h-5" alt="Icon" src="/svg-5.svg" />
                        <span className="text-[#817b8e] text-sm font-normal">
                          Live
                        </span>
                      </div>
                      <img className="w-5 h-5" alt="Icon" src="/svg-16.svg" />
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[#ffffff14]">
                            <TableHead className="pl-4 text-white text-sm">
                              Topic
                            </TableHead>
                            <TableHead className="text-white text-sm text-right">
                              Volume
                            </TableHead>
                            <TableHead className="text-white text-sm text-right">
                              Sentiment
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-transparent">
                          {sentimentTopics.map((item, idx) => (
                            <TableRow
                              key={idx}
                              className="bg-[#0a011833] border-b border-[#ffffff14]"
                            >
                              <TableCell className="pl-4 border-r border-[#ffffff14]">
                                <div className="flex items-center gap-3">
                                  <Checkbox className="w-4 h-4 bg-[#ffffff0a] rounded-lg border border-[#ffffff1f]" />
                                  <span className="text-white text-sm font-normal">
                                    {item.topic}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-white text-sm text-right">
                                {item.volume}
                              </TableCell>
                              <TableCell className="text-white text-sm text-right">
                                {item.sentiment}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-[#0a011833] border-t border-[#ffffff14] p-3 flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs opacity-50">
                          TOPICS
                        </span>
                        <span className="text-white text-xs">2.4M</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs opacity-50">
                          ANALYZED
                        </span>
                        <span className="text-white text-xs">1.8M</span>
                      </div>
                    </div>
                  </Card>

                  {/* Trend predictions table */}
                  <Card className="bg-[#ffffff0a] border border-white/20 rounded overflow-hidden">
                    <div className="bg-[#ffffff0a] border-b border-white/20 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img className="w-5 h-5" alt="Icon" src="/svg-26.svg" />
                        <span className="text-white text-sm font-normal">
                          Trend Predictions
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5">
                        <img className="w-5 h-5" alt="Icon" src="/svg-5.svg" />
                        <span className="text-[#817b8e] text-sm font-normal">
                          AI Powered
                        </span>
                      </div>
                      <img className="w-5 h-5" alt="Icon" src="/svg-16.svg" />
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[#ffffff14]">
                            <TableHead className="pl-4 text-white text-sm">
                              Trend
                            </TableHead>
                            <TableHead className="text-white text-sm text-right">
                              Signals
                            </TableHead>
                            <TableHead className="text-white text-sm text-right border-r border-[#ffffff14]">
                              Confidence
                            </TableHead>
                            <TableHead className="text-white text-sm text-right">
                              Impact
                            </TableHead>
                            <TableHead className="text-white text-sm text-right">
                              Timeframe
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-transparent">
                          {trendPredictions.map((item, idx) => (
                            <TableRow
                              key={idx}
                              className="bg-[#0a011833] border-b border-[#ffffff14]"
                            >
                              <TableCell className="pl-4 border-r border-[#ffffff14]">
                                <div className="flex items-center gap-3">
                                  <Checkbox className="w-4 h-4 bg-[#ffffff0a] rounded-lg border border-[#ffffff1f]" />
                                  <span className="text-white text-sm font-normal">
                                    {item.trend}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-white text-sm text-right">
                                {item.signals}
                              </TableCell>
                              <TableCell className="text-white text-sm text-right border-r border-[#ffffff14]">
                                {item.confidence}
                              </TableCell>
                              <TableCell className="text-white text-sm text-right">
                                {item.impact}
                              </TableCell>
                              <TableCell className="text-white text-sm text-right">
                                {item.timeframe}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-[#0a011833] border-t border-[#ffffff14] p-3 flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs opacity-50">
                          TRENDS
                        </span>
                        <span className="text-white text-xs">847K</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs opacity-50">
                          PREDICTED
                        </span>
                        <span className="text-white text-xs">621K</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="p-8 text-center">
                <h3 className="text-[28px] leading-9 font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
                  Multi-Source Reasoning with Proactive Alerts
                </h3>
                <p className="text-[#9b96b0] text-base leading-6 tracking-[-0.16px]">
                  Detect opinion shifts by cross-analyzing heterogeneous inputs
                  with self-improvement through reinforcement learning.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
