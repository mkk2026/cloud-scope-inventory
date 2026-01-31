
import { GoogleGenAI } from "@google/genai";
import { CloudResource } from "../types";

// Helper to summarize data for the prompt to avoid token limits
const summarizeInventory = (resources: CloudResource[]) => {
  const totalCost = resources.reduce((acc, r) => acc + r.costPerMonth, 0);
  const providerCost: Record<string, number> = { AWS: 0, Azure: 0, GCP: 0 };
  const typeCounts: Record<string, number> = {};
  const untaggedResources = resources.filter(r => Object.keys(r.tags).length === 0);

  // Identify Cost Optimization Opportunities
  const stoppedResources = resources.filter(r => r.status === 'Stopped');
  const stoppedCost = stoppedResources.reduce((acc, r) => acc + r.costPerMonth, 0);
  
  // Identify Security Risks (Pre-calculated by Compliance Engine)
  const highRiskResources = resources.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High');
  const riskDetails = highRiskResources.map(r => ({
     id: r.id,
     name: r.name,
     issues: r.securityIssues,
     type: r.type,
     riskLevel: r.riskLevel
  }));

  // Identify RI / Savings Plan Candidates (Running Compute & DBs)
  const riCandidates = resources.filter(r => 
    (r.type === 'Compute Instance' || r.type === 'Database') && 
    r.status === 'Running'
  );
  const riEligibleCost = riCandidates.reduce((acc, r) => acc + r.costPerMonth, 0);

  let riDescription = "Running Compute Instances and Databases suitable for Reserved Instances or Savings Plans.";
  if (riEligibleCost > 1000 && riCandidates.length > 0) {
    riDescription = "High potential for savings! Recommend purchasing Reserved Instances (AWS/Azure) or Savings Plans (AWS/GCP) for a 1-3 year term to save 40-72% on these consistent workloads.";
  }

  const topExpensiveResources = [...resources]
    .sort((a, b) => b.costPerMonth - a.costPerMonth)
    .slice(0, 5)
    .map(r => ({
      name: r.name,
      type: r.type,
      provider: r.provider,
      status: r.status,
      cost: r.costPerMonth
    }));

  resources.forEach(r => {
    if (providerCost[r.provider] !== undefined) {
      providerCost[r.provider] += r.costPerMonth;
    }
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
  });

  return JSON.stringify({
    overview: {
      totalMonthlyCost: totalCost,
      totalResourceCount: resources.length,
      untaggedResourceCount: untaggedResources.length,
      highRiskCount: highRiskResources.length
    },
    complianceFindings: riskDetails,
    costsByProvider: providerCost,
    resourceTypeDistribution: Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
    optimizationInsights: {
      stoppedResources: {
        count: stoppedResources.length,
        monthlyWastedCost: stoppedCost,
        examples: stoppedResources.slice(0, 3).map(r => `${r.name} (${r.type})`)
      },
      reservedInstanceOpportunities: {
        eligibleResourceCount: riCandidates.length,
        monthlyEligibleCost: riEligibleCost,
        description: riDescription
      },
      topExpensiveResources
    }
  }, null, 2);
};

export const analyzeInventory = async (resources: CloudResource[], promptSuffix: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Error: API Key is missing. Please check your configuration.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const summary = summarizeInventory(resources);
    
    const prompt = `
      You are a Senior Cloud Security Architect and FinOps Specialist. You are analyzing a cloud inventory that has undergone automated compliance checks against industry standards (like CIS Benchmarks).
      
      Inventory Data & Compliance Findings:
      ${summary}

      User Question: ${promptSuffix}
      
      Analysis Instructions:
      1. Review 'complianceFindings' (derived from automated checks). If there are CIS violations (e.g., Public Buckets, Unencrypted DBs), prioritize these security risks above cost.
      2. Explain *why* these are risks using standard industry terminology (e.g., "Data Exfiltration risk", "Compliance Violation").
      3. Recommend specific remediation steps (e.g., "Enable server-side encryption with KMS", "Restrict Security Group 0.0.0.0/0").
      4. After security, address 'optimizationInsights' for cost savings (Stopped resources, Reserved Instances).
      5. Provide concrete, data-backed recommendations.
      6. Use Markdown for formatting (Alerts for Critical risks, bullet points).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights. Please try again later.";
  }
};
