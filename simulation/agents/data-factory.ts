import Anthropic from "@anthropic-ai/sdk";
import type { CompanyProfile } from "../types.js";

const client = new Anthropic();

const ARCHETYPES = [
  {
    id: "b2c-fintech",
    archetype: "B2C fintech",
    brief:
      "A Series B consumer fintech company in India (~300 people). The PM owns a growth/activation funnel. Heavy Slack + Linear + Mixpanel usage. WhatsApp is the real coordination layer for cross-team chatter. Most data work happens in Metabase or Looker.",
  },
  {
    id: "b2b-saas",
    archetype: "B2B SaaS",
    brief:
      "A Series C B2B SaaS company (~150 people, US-based). The PM owns the integrations/platform surface. Jira + Confluence is the primary workflow. Salesforce matters because every feature request traces back to a deal. Teams instead of Slack.",
  },
  {
    id: "early-startup",
    archetype: "early-stage startup",
    brief:
      "A seed-stage startup (~20 people). The founding PM wears many hats: product, some customer success, some ops. Notion is the single source of truth. No formal ticketing — GitHub issues and Slack threads. Very fast-moving, high context in people's heads.",
  },
  {
    id: "enterprise",
    archetype: "enterprise",
    brief:
      "A large enterprise (~10,000 employees), financial services. The PM is a product operations role — process-heavy, compliance-aware. Outlook + Teams for communication. SharePoint for docs. ServiceNow for anything operational. Power BI for data.",
  },
];

async function generateCompanyProfile(archetype: (typeof ARCHETYPES)[number]): Promise<CompanyProfile> {
  const prompt = `You are generating realistic synthetic test data for a product simulation.

Generate a detailed company profile for this archetype:
${archetype.brief}

Return a single JSON object matching this TypeScript interface exactly:

{
  id: string,                    // use "${archetype.id}"
  name: string,                  // realistic company name (NOT a real company)
  industry: string,
  stage: string,
  size: string,
  city: string,
  archetype: string,             // "${archetype.archetype}"
  persona: {
    name: string,                // realistic first+last name
    role: string,                // specific job title
    company: string,             // same as name above
    tenure: string,              // e.g. "2 years"
    reportsTo: string,           // their manager's name and title
    toolStack: string[],         // EVERY tool they use — be exhaustive and realistic (8-15 tools)
    primaryCommsTools: string[], // 2-3 tools where most work actually happens
    invisibleComms: string[],    // tools we can't see: WhatsApp, phone, in-person
    projects: [                  // exactly 3 projects
      {
        name: string,
        codename?: string,
        status: "active" | "winding-down" | "blocked" | "planning",
        description: string,     // 1-2 sentences, specific and realistic
        tools: string[],
        keyPeople: string[]
      }
    ],
    collaborators: [             // exactly 5 collaborators
      {
        name: string,
        role: string,
        relationship: "manager" | "direct-report" | "peer" | "cross-functional" | "external",
        commsChannel: string
      }
    ],
    emailPatterns: [             // 8-12 realistic email notification subjects+senders
      {
        subject: string,         // realistic notification subject line (e.g. "[Linear] Priya assigned you #KYC-142")
        sender: string,          // sending domain (e.g. "notify@linear.app")
        tool?: string            // which tool this reveals (e.g. "Linear")
      }
    ],
    calendarPatterns: [          // 4-6 recurring meetings
      {
        title: string,
        recurrence: string,      // "weekly", "biweekly", "daily"
        organizer: string,
        attendees: string[],
        videoLink?: string       // domain only: "zoom.us" or "meet.google.com"
      }
    ],
    weekNarrativeSeed: string    // 3-4 sentences: what actually happened this week for this persona — specific, concrete, includes blockers and wins. This is used to prompt the persona to narrate.
  }
}

Requirements:
- Make it feel real. Use specific codenames, metric names, realistic blockers.
- The tool stack must match the archetype's reality (enterprise shouldn't have Linear; startup shouldn't have ServiceNow).
- Email patterns should reveal roughly 70% of the tool stack — leave 2-3 tools undiscoverable by email alone.
- The week narrative should mention at least 2 projects and 2 people by name.

Return ONLY the JSON object, no markdown, no explanation.`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`DataFactory: no JSON in response for ${archetype.id}`);

  return JSON.parse(jsonMatch[0]) as CompanyProfile;
}

export async function runDataFactory(): Promise<CompanyProfile[]> {
  console.log("🏭  DataFactory: generating 4 company profiles...");
  const profiles = await Promise.all(ARCHETYPES.map(generateCompanyProfile));
  console.log(`✓  DataFactory: generated ${profiles.map((p) => p.name).join(", ")}`);
  return profiles;
}
