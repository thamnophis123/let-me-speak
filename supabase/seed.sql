-- Seed one sample project (Cedar Ridge data center).
-- Run after supabase/schema.sql.

insert into public.projects (
  id,
  slug,
  title,
  jurisdiction,
  status,
  summary,
  recommendation,
  decisive_factors,
  uncertainties,
  confidence,
  confidence_note
) values (
  '11111111-1111-4111-8111-111111111111',
  'cedar-ridge-data-center',
  'AetherGrid Cedar Ridge Campus — Special Use Permit SUP-2026-14',
  'Cedar County Planning Commission',
  'Open for Comment',
  'Cedar County is reviewing a special use permit for a 180-acre, 240 MW hyperscale data center at the Cedar Ridge Industrial Park. The Commission must decide whether the fiscal and employment benefits outweigh water, power, noise, and farmland-conversion risks, and what conditions would be required if the project proceeds.',
  'Approve the special use permit only with binding conditions on water, noise, and community benefit. Denial is not required by the current record, but approval without those conditions would leave the strongest public-interest risks unmanaged.',
  array[
    'The site is consistent with existing industrial zoning and the comprehensive plan.',
    'The fiscal benefit is real after independent review, but it depends on the improvements remaining taxable.',
    'Water use in a stressed basin is the unresolved constraint and must be capped, metered, and curtailed in drought.',
    'Noise and generator impacts appear mitigable if berms, testing limits, and complaint response are conditions of approval.',
    'Power availability is a 2028 problem, not a 2026 blackout problem, but feeder headroom for housing still needs a written utility confirmation.'
  ],
  array[
    'Final Cedar Valley groundwater model (expected Q4 2026) could change the safe-yield finding.',
    'Hours of backup-generator runtime during grid events are not bounded in the application.',
    'Permanent local hiring versus remote/contractor operations is not contractually committed.'
  ],
  'Medium',
  'The land-use fit and fiscal findings are solid. Water and long-run power remain the main reasons this is not a high-confidence recommendation.'
)
on conflict (slug) do nothing;

insert into public.evidence_items (project_id, title, source, summary, status, sort_order) values
  (
    '11111111-1111-4111-8111-111111111111',
    'County Fiscal Impact Study',
    'Cedar County Finance Department, July 2026',
    'Staff estimates $18.4 million in net new property-tax revenue over 10 years after abatements, plus modest local sales tax during construction. Figures were reviewed by the independent county auditor.',
    'Verified',
    1
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Potable and Process Water Demand Memo',
    'AetherGrid application appendix C',
    'Applicant states average use of 1.1 million gallons per day at full build-out, with a closed-loop cooling design and on-site reuse. Independent metering and drought curtailment terms are not yet specified.',
    'Company Claim',
    2
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Trip Generation and Construction Traffic',
    'Planning staff estimate, June 2026',
    'Staff projects 420 peak construction trips and 90 permanent employee trips per day. The estimate uses ITE rates, not a full traffic study, and does not yet include heavy-haul transformer deliveries.',
    'Staff Estimate',
    3
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Cedar Valley Groundwater Basin Capacity',
    'County Water Agency briefing, pending USGS update',
    'The basin is already in a Stage 2 watch. Whether the campus can be served without reducing nearby agricultural allocations is unresolved until the 2026 basin model is published.',
    'Open Question',
    4
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Grid Interconnection and Reliability Letter',
    'Regional transmission operator, May 2026',
    'The operator confirms a 2028–2029 interconnection window on a new 230 kV tap. The letter does not guarantee local capacity for simultaneous housing electrification projects.',
    'Verified',
    5
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'Operational Noise Model',
    'AetherGrid environmental narrative',
    'Applicant models 45 dBA at the nearest dwelling with 24-foot berms and low-noise dry coolers. Backup diesel testing is assumed at 12 hours per year; emergency runtime is not modeled.',
    'Company Claim',
    6
  );

insert into public.claims (project_id, side, claim, note, strength, sort_order) values
  (
    '11111111-1111-4111-8111-111111111111',
    'for',
    'The campus would add a durable tax base for schools and emergency services.',
    'The audited fiscal study shows positive net revenue after the proposed seven-year abatement, with most value in real property rather than easily relocated equipment.',
    'Strong',
    1
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'for',
    'The site is already industrially zoned and avoids downtown or residential conversion.',
    'Cedar Ridge has been planned for heavy industrial use since 2014. Approving a data center here is more consistent with the comprehensive plan than opening a new industrial node.',
    'Strong',
    2
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'for',
    'Construction and operations would create local jobs, including skilled trades.',
    'The applicant pledges a project-labor agreement for construction. Permanent headcount is smaller (about 80 on-site) and should not be overstated as a county employment strategy.',
    'Moderate',
    3
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'against',
    'Water demand would compete with farms during drought.',
    '1.1 MGD is material in a Stage 2 basin. Without a hard cap, curtailment protocol, and third-party metering, the county cannot show that agricultural users are protected.',
    'Strong',
    1
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'against',
    'The interconnection may crowd out capacity needed for housing and electrification.',
    'The operator letter confirms a tap, not spare feeder capacity. Planning staff cannot yet show that nearby subdivisions and the hospital campus retain headroom through 2030.',
    'Moderate',
    2
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'against',
    'Night noise and generator testing would change the rural soundscape.',
    'Nearest homes are 1,200 feet from the mechanical yard. The model depends on unbuilt berms and an optimistic generator-testing schedule.',
    'Moderate',
    3
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'examined',
    'The project will crash property values across the entire county.',
    'No countywide appraisal evidence was submitted. Effects, if any, are localized to adjacent parcels and should be analyzed there rather than treated as a countywide collapse.',
    'Invalid',
    1
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'examined',
    'There is zero local benefit because the owner is an out-of-state LLC.',
    'Property tax is assessed on the land and improvements regardless of parent-company domicile. Ownership form does not cancel the fiscal study.',
    'Invalid',
    2
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'examined',
    'The campus will cause rolling blackouts this summer.',
    'Interconnection is scheduled for 2028–2029. The claim is not applicable to current-year peak load.',
    'Not Applicable',
    3
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'examined',
    'Data centers never hire locally, so job claims can be dismissed.',
    'Construction hiring through a PLA is documented. Permanent operations jobs are limited, but that is a reason to weight them modestly, not to treat the whole claim as false.',
    'Weak',
    4
  );

insert into public.analysis_versions (project_id, version, summary, published_at) values
  (
    '11111111-1111-4111-8111-111111111111',
    'v0.1',
    'Evidence baseline assembled from the application and county staff reports.',
    '2026-06-18'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'v0.2',
    'Argument map drafted; weak and inapplicable claims separated from the live dispute.',
    '2026-07-09'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'v0.3',
    'Preliminary recommendation posted. Public comment window opened through September 15.',
    '2026-08-12'
  );
