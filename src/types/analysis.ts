export interface AnalysisResult {
  summary: string;
  keyFindings: string[];
  sentiment: {
    overall: string;
    score: number;
    breakdown: { label: string; value: number }[];
  };
  recommendations: string[];
  metrics: { label: string; value: string; change: string }[];
  anomalies: { description: string; severity: "low" | "medium" | "high"; confidence: number }[];
  chartData: {
    timeSeries: { label: string; value: number }[];
    distribution: { label: string; value: number }[];
    categories: { label: string; value: number }[];
  };
  modelInfo: {
    model: string;
    tokensUsed: number;
    latencyMs: number;
    confidence: number;
  };
}
