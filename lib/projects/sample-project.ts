import type { ProjectAnalysis } from "./types";

export const sampleProject: ProjectAnalysis = {
  id: "cedar-ridge-data-center",
  title: "AetherGrid Cedar Ridge Campus — Special Use Permit SUP-2026-14",
  jurisdiction: "Cedar County Planning Commission",
  status: "Open for Comment",
  summary:
    "Cedar County is reviewing a special use permit for a 180-acre, 240 MW hyperscale data center at the Cedar Ridge Industrial Park. The Commission must decide whether the fiscal and employment benefits outweigh water, power, noise, and farmland-conversion risks, and what conditions would be required if the project proceeds.",
  version: "v0.3",
  lastUpdated: "August 12, 2026",
  evidence: [
    {
      id: "e1",
      title: "County Fiscal Impact Study",
      source: "Cedar County Finance Department, July 2026",
      summary:
        "Staff estimates $18.4 million in net new property-tax revenue over 10 years after abatements, plus modest local sales tax during construction. Figures were reviewed by the independent county auditor.",
      status: "Verified",
    },
    {
      id: "e2",
      title: "Potable and Process Water Demand Memo",
      source: "AetherGrid application appendix C",
      summary:
        "Applicant states average use of 1.1 million gallons per day at full build-out, with a closed-loop cooling design and on-site reuse. Independent metering and drought curtailment terms are not yet specified.",
      status: "Company Claim",
    },
    {
      id: "e3",
      title: "Trip Generation and Construction Traffic",
      source: "Planning staff estimate, June 2026",
      summary:
        "Staff projects 420 peak construction trips and 90 permanent employee trips per day. The estimate uses ITE rates, not a full traffic study, and does not yet include heavy-haul transformer deliveries.",
      status: "Staff Estimate",
    },
    {
      id: "e4",
      title: "Cedar Valley Groundwater Basin Capacity",
      source: "County Water Agency briefing, pending USGS update",
      summary:
        "The basin is already in a Stage 2 watch. Whether the campus can be served without reducing nearby agricultural allocations is unresolved until the 2026 basin model is published.",
      status: "Open Question",
    },
    {
      id: "e5",
      title: "Grid Interconnection and Reliability Letter",
      source: "Regional transmission operator, May 2026",
      summary:
        "The operator confirms a 2028–2029 interconnection window on a new 230 kV tap. The letter does not guarantee local capacity for simultaneous housing electrification projects.",
      status: "Verified",
    },
    {
      id: "e6",
      title: "Operational Noise Model",
      source: "AetherGrid environmental narrative",
      summary:
        "Applicant models 45 dBA at the nearest dwelling with 24-foot berms and low-noise dry coolers. Backup diesel testing is assumed at 12 hours per year; emergency runtime is not modeled.",
      status: "Company Claim",
    },
  ],
  argumentsFor: [
    {
      id: "f1",
      claim: "The campus would add a durable tax base for schools and emergency services.",
      note: "The audited fiscal study shows positive net revenue after the proposed seven-year abatement, with most value in real property rather than easily relocated equipment.",
      strength: "Strong",
    },
    {
      id: "f2",
      claim: "The site is already industrially zoned and avoids downtown or residential conversion.",
      note: "Cedar Ridge has been planned for heavy industrial use since 2014. Approving a data center here is more consistent with the comprehensive plan than opening a new industrial node.",
      strength: "Strong",
    },
    {
      id: "f3",
      claim: "Construction and operations would create local jobs, including skilled trades.",
      note: "The applicant pledges a project-labor agreement for construction. Permanent headcount is smaller (about 80 on-site) and should not be overstated as a county employment strategy.",
      strength: "Moderate",
    },
  ],
  argumentsAgainst: [
    {
      id: "a1",
      claim: "Water demand would compete with farms during drought.",
      note: "1.1 MGD is material in a Stage 2 basin. Without a hard cap, curtailment protocol, and third-party metering, the county cannot show that agricultural users are protected.",
      strength: "Strong",
    },
    {
      id: "a2",
      claim: "The interconnection may crowd out capacity needed for housing and electrification.",
      note: "The operator letter confirms a tap, not spare feeder capacity. Planning staff cannot yet show that nearby subdivisions and the hospital campus retain headroom through 2030.",
      strength: "Moderate",
    },
    {
      id: "a3",
      claim: "Night noise and generator testing would change the rural soundscape.",
      note: "Nearest homes are 1,200 feet from the mechanical yard. The model depends on unbuilt berms and an optimistic generator-testing schedule.",
      strength: "Moderate",
    },
  ],
  argumentsWeak: [
    {
      id: "w1",
      claim: "The project will crash property values across the entire county.",
      note: "No countywide appraisal evidence was submitted. Effects, if any, are localized to adjacent parcels and should be analyzed there rather than treated as a countywide collapse.",
      strength: "Invalid",
    },
    {
      id: "w2",
      claim: "There is zero local benefit because the owner is an out-of-state LLC.",
      note: "Property tax is assessed on the land and improvements regardless of parent-company domicile. Ownership form does not cancel the fiscal study.",
      strength: "Invalid",
    },
    {
      id: "w3",
      claim: "The campus will cause rolling blackouts this summer.",
      note: "Interconnection is scheduled for 2028–2029. The claim is not applicable to current-year peak load.",
      strength: "Not Applicable",
    },
    {
      id: "w4",
      claim: "Data centers never hire locally, so job claims can be dismissed.",
      note: "Construction hiring through a PLA is documented. Permanent operations jobs are limited, but that is a reason to weight them modestly, not to treat the whole claim as false.",
      strength: "Weak",
    },
  ],
  recommendation:
    "Approve the special use permit only with binding conditions on water, noise, and community benefit. Denial is not required by the current record, but approval without those conditions would leave the strongest public-interest risks unmanaged.",
  decisiveFactors: [
    "The site is consistent with existing industrial zoning and the comprehensive plan.",
    "The fiscal benefit is real after independent review, but it depends on the improvements remaining taxable.",
    "Water use in a stressed basin is the unresolved constraint and must be capped, metered, and curtailed in drought.",
    "Noise and generator impacts appear mitigable if berms, testing limits, and complaint response are conditions of approval.",
    "Power availability is a 2028 problem, not a 2026 blackout problem, but feeder headroom for housing still needs a written utility confirmation.",
  ],
  uncertainties: [
    "Final Cedar Valley groundwater model (expected Q4 2026) could change the safe-yield finding.",
    "Hours of backup-generator runtime during grid events are not bounded in the application.",
    "Permanent local hiring versus remote/contractor operations is not contractually committed.",
  ],
  confidence: "Medium",
  confidenceNote:
    "The land-use fit and fiscal findings are solid. Water and long-run power remain the main reasons this is not a high-confidence recommendation.",
  versions: [
    {
      version: "v0.1",
      date: "June 18, 2026",
      summary: "Evidence baseline assembled from the application and county staff reports.",
    },
    {
      version: "v0.2",
      date: "July 9, 2026",
      summary: "Argument map drafted; weak and inapplicable claims separated from the live dispute.",
    },
    {
      version: "v0.3",
      date: "August 12, 2026",
      summary: "Preliminary recommendation posted. Public comment window opened through September 15.",
    },
  ],
};

export const sampleProjectsById: Record<string, ProjectAnalysis> = {
  [sampleProject.id]: sampleProject,
};
