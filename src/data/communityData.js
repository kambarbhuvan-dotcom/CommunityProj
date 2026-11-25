/**
 * communityData.js
 *
 * Privacy-friendly community datasets for SolarConnect's Community Module:
 * - Aggregated overview statistics
 * - Building and anonymized unit leaderboards
 * - Community announcements (Campaigns, Workshops, Conservation, Achievements)
 * - Upcoming and completed community events with interactive participation
 * - Official community achievement badges (Solar Starter, Energy Saver, Green Champion)
 */

export const COMMUNITY_OVERVIEW = {
  totalHouseholds: 48,
  activeGeneratingHouseholds: 36,
  totalGeneratedKwh: 24205,
  totalUtilizedKwh: 19364,
  totalCO2AvoidedKg: 15888.1,
  totalTreesEquivalent: 756,
  totalMoneySavedRs: 145230,
  currentMonthTargetKwh: 5000,
  currentMonthProgressKwh: 3840,
}

export const BUILDING_LEADERBOARD = [
  {
    rank: 1,
    name: 'Sunrise Apartments Block A',
    households: 14,
    installedCapacityKw: 48.0,
    monthGenKwh: 1420.5,
    monthUtilizedKwh: 1180.0,
    selfSufficiency: 92,
    co2AvoidedKg: 1164.8,
    badge: 'Top Generating Building',
  },
  {
    rank: 2,
    name: 'Green Valley Eco-Homes',
    households: 12,
    installedCapacityKw: 42.5,
    monthGenKwh: 1280.2,
    monthUtilizedKwh: 1090.5,
    selfSufficiency: 89,
    co2AvoidedKg: 1049.8,
    badge: 'Highest Self-Sufficiency',
  },
  {
    rank: 3,
    name: 'Sunrise Apartments Block B',
    households: 12,
    installedCapacityKw: 36.0,
    monthGenKwh: 980.4,
    monthUtilizedKwh: 840.2,
    selfSufficiency: 86,
    co2AvoidedKg: 803.9,
    badge: 'Most Improved Yield',
  },
  {
    rank: 4,
    name: 'Solar Heights Residency',
    households: 10,
    installedCapacityKw: 28.0,
    monthGenKwh: 760.8,
    monthUtilizedKwh: 640.0,
    selfSufficiency: 84,
    co2AvoidedKg: 623.8,
    badge: 'Newest Solar Adopters',
  },
]

export const ANONYMOUS_UNIT_LEADERBOARD = [
  { rank: 1, unitCode: 'Unit B-201', building: 'Block B', genKwh: 495.2, utiKwh: 430.1, co2Kg: 406.1, selfSufficiency: 94 },
  { rank: 2, unitCode: 'Unit C-302', building: 'Block C', genKwh: 462.1, utiKwh: 398.0, co2Kg: 378.9, selfSufficiency: 92 },
  { rank: 3, unitCode: 'Unit A-102', building: 'Block A', genKwh: 418.0, utiKwh: 365.4, co2Kg: 342.8, selfSufficiency: 91 },
  { rank: 4, unitCode: 'Unit C-301', building: 'Block C', genKwh: 384.6, utiKwh: 330.2, co2Kg: 315.4, selfSufficiency: 89 },
  { rank: 5, unitCode: 'Unit A-101', building: 'Block A', genKwh: 342.5, utiKwh: 298.0, co2Kg: 280.9, selfSufficiency: 88 },
  { rank: 6, unitCode: 'Unit B-202', building: 'Block B', genKwh: 268.4, utiKwh: 220.5, co2Kg: 220.1, selfSufficiency: 78 },
]

export const COMMUNITY_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    type: 'campaign',
    category: 'Solar Awareness Campaign',
    title: 'Clean Energy Week: Terrace Solar Walk & Talk',
    date: '2026-11-20',
    summary: 'Join our certified resident solar champions for an open rooftop walkthrough to see live Mono-PERC and TOPCon inverter setups in action.',
    highlight: 'Open to all residents considering rooftop installation',
  },
  {
    id: 'ann-2',
    type: 'workshop',
    category: 'Solar Installation Workshop',
    title: 'PM Surya Ghar & Net Metering Feasibility Clinic',
    date: '2026-11-15',
    summary: 'Local DISCOM authorized engineers will review roof feasibility documents and guide residents on single-window subsidy application procedures.',
    highlight: 'Assistance with national portal registration',
  },
  {
    id: 'ann-3',
    type: 'conservation',
    category: 'Energy Conservation Activity',
    title: 'Bi-Monthly Community Panel Cleaning Drive',
    date: '2026-11-08',
    summary: 'Volunteers and maintenance staff are coordinating seasonal panel washing to wash off winter airborne dust and maximize November kilowatt-hours.',
    highlight: 'Supplies provided at Common Clubhouse terrace',
  },
  {
    id: 'ann-4',
    type: 'achievement',
    category: 'Community Achievement',
    title: 'Milestone: Community Generates Over 24,000 kWh!',
    date: '2026-11-01',
    summary: 'Our collective rooftop generation has crossed 24 MWh, avoiding over 15 tonnes of coal-based CO2 emissions since initiative inception.',
    highlight: 'Celebrated at monthly residents council',
  },
]

export const COMMUNITY_EVENTS = [
  {
    id: 'evt-1',
    title: 'Solar Inverter Health & Safety Inspection Camp',
    category: 'Workshop',
    date: 'Saturday, 28 Nov 2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Community Clubhouse & Block A Terrace',
    facilitator: 'Technical Advisory Committee',
    registeredCount: 28,
    capacity: 40,
    status: 'upcoming',
    description: 'Free multimeter earthing check and inverter firmware audit for all installed units. Recommended for systems operating over 1 year.',
  },
  {
    id: 'evt-2',
    title: 'Rooftop Solar for Beginners: Feasibility & Financials',
    category: 'Awareness Campaign',
    date: 'Sunday, 06 Dec 2026',
    time: '11:00 AM – 12:30 PM',
    location: 'Central Community Hall & Live Stream',
    facilitator: 'SolarConnect Core Team',
    registeredCount: 34,
    capacity: 50,
    status: 'upcoming',
    description: 'An interactive seminar breaking down upfront capital costs, central government subsidies, and return on investment for non-solar households.',
  },
  {
    id: 'evt-3',
    title: 'Hands-On Water-Efficient Panel Washing Clinic',
    category: 'Conservation',
    date: 'Saturday, 12 Dec 2026',
    time: '7:30 AM – 9:00 AM',
    location: 'Block B Common Terrace',
    facilitator: 'Green Maintenance Volunteers',
    registeredCount: 19,
    capacity: 25,
    status: 'upcoming',
    description: 'Demonstrating water-efficient microfiber wiper techniques to clean panels without scratching glass or wasting potable water.',
  },
]

export const COMPLETED_ACTIVITIES = [
  {
    id: 'comp-1',
    title: 'Monsoon Electrical Earthing & SPD Audit',
    date: 'October 2026',
    participants: 42,
    outcome: 'Zero lightning or surge trips recorded across 36 active systems during October rainstorms.',
  },
  {
    id: 'comp-2',
    title: 'DISCOM Joint Net-Metering Coordination Meet',
    date: 'September 2026',
    participants: 55,
    outcome: 'Expedited bidirectional meter installation clearances for 8 newly onboarded resident flats.',
  },
  {
    id: 'comp-3',
    title: 'Community Bulk Procurement Drive for Mono-PERC Panels',
    date: 'July 2026',
    participants: 30,
    outcome: 'Negotiated 12% bulk discount with Tier-1 DCR empanelled manufacturer for participating units.',
  },
]

export const ACHIEVEMENT_BADGES = [
  {
    id: 'badge-1',
    name: 'Solar Starter',
    icon: 'Sun',
    tier: 'Bronze',
    requirement: 'Log your first clean solar kWh in the tracking module',
    criteriaProgress: '100% Complete',
    unlocked: true,
    unlockedDate: 'Earned on Day 1',
    description: 'Welcome to the clean grid! Awarded for making the transition to solar energy awareness.',
  },
  {
    id: 'badge-2',
    name: 'Energy Saver',
    icon: 'Zap',
    tier: 'Silver',
    requirement: 'Achieve >85% solar self-consumption in a single month',
    criteriaProgress: '88% Achieved',
    unlocked: true,
    unlockedDate: 'Earned This Month',
    description: 'Master of energy timing! Awarded for shifting heavy home appliances into peak solar hours.',
  },
  {
    id: 'badge-3',
    name: 'Green Community Champion',
    icon: 'Trophy',
    tier: 'Gold',
    requirement: 'Participate in 2+ community workshops and help neighbors adopt solar',
    criteriaProgress: '1 / 2 Activities',
    unlocked: false,
    unlockedDate: 'In Progress',
    description: 'Leading by example! Awarded for active participation in community clean energy events.',
  },
]

