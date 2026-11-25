/**
 * learnSolarContent.js
 *
 * Comprehensive, beginner-friendly educational articles and daily solar tips
 * for SolarConnect's "Learn Solar" educational hub.
 *
 * Covers 9 dedicated categories:
 * 1. Introduction to Solar Energy
 * 2. How Solar Panels Work
 * 3. Types of Solar Panels
 * 4. Benefits of Solar Energy
 * 5. Solar Panel Installation Guide
 * 6. Solar Panel Maintenance
 * 7. Solar Energy Cost and Savings
 * 8. Government Solar Schemes in India (with official links and verification guidance)
 * 9. Frequently Asked Questions
 */

export const SOLAR_TIPS_OF_THE_DAY = [
  {
    id: 'tip-1',
    title: 'Shift Heavy Appliances to Peak Sun Hours',
    category: 'Consumption Timing',
    icon: 'Sun',
    tip: 'Run your washing machine, water pump, and EV charger between 11:00 AM and 3:00 PM to directly utilize your solar power and avoid drawing from the grid.',
    impact: 'Increases self-consumption by up to 35%',
  },
  {
    id: 'tip-2',
    title: 'Clean Panels Early in the Morning',
    category: 'Maintenance',
    icon: 'Wrench',
    tip: 'Always clean solar panels early in the morning when the glass is cool. Spraying cold water on hot afternoon glass can cause thermal micro-cracks.',
    impact: 'Prevents thermal shock & recovers 10-20% lost yield',
  },
  {
    id: 'tip-3',
    title: 'Check Your Inverter Light Status Weekly',
    category: 'System Health',
    icon: 'Zap',
    tip: 'A steady green LED on your string inverter indicates healthy grid synchronization. A blinking amber light usually indicates an isolation or grid-frequency issue.',
    impact: 'Ensures zero undetected downtime',
  },
  {
    id: 'tip-4',
    title: 'Trim Overhanging Foliage Before Monsoon',
    category: 'Shading',
    icon: 'Leaf',
    tip: 'Even 10% partial shading on one panel in a series string can reduce the power generation of the entire string by more than 30%.',
    impact: 'Eliminates hot-spots and bypass-diode wear',
  },
  {
    id: 'tip-5',
    title: 'Track Seasonal Angle Variance',
    category: 'Optimization',
    icon: 'Compass',
    tip: 'In India, the optimal tilt angle for fixed solar panels equals the local latitude (typically 15° to 28° south-facing). Seasonal adjustments in summer vs winter can gain 5% extra yield.',
    impact: 'Maximizes annual solar kilowatt-hour yield',
  },
]

export const LEARN_SOLAR_TOPICS = [
  {
    id: 'topic-1',
    slug: 'intro-to-solar-energy',
    category: 'Introduction to Solar Energy',
    title: 'Introduction to Solar Energy',
    summary: 'Discover the power of solar energy, from radiant sunlight to clean, limitless electricity for modern households.',
    readTime: '4 min read',
    icon: 'Sun',
    accentColor: 'from-[#0EA5E9] to-[#2563EB]',
    tags: ['Basics', 'Renewable Energy', 'Beginners'],
    content: `
## What is Solar Energy?

Solar energy is the abundant light and radiant heat emitted by the Sun. Every single hour, the Earth intercepts enough solar irradiance to power global humanity's annual energy needs. By deploying **photovoltaic (PV) technology**, we capture this limitless resource and convert it into clean, usable alternating current (AC) electricity right where we live.

Unlike fossil fuel power plants that burn finite coal, oil, or gas, solar systems produce electricity with **zero greenhouse gas emissions**, zero fuel consumption, and zero noise pollution during everyday operation.

---

## The Clean Energy Transition

Modern residential solar power plays an indispensable role in combating global climate change and urban air pollution:

* **Abundant and Inexhaustible:** The Sun will radiate energy for billions of years.
* **Decentralized Generation:** Rooftop solar produces energy right where it is consumed, eliminating high-voltage transmission losses.
* **Grid Resilience:** Homes with rooftop solar reduce the peak daytime cooling strain on the public utility grid.

---

## Core Components of a Rooftop Solar System

A complete residential rooftop solar system consists of four primary components:

1. **Solar Photovoltaic (PV) Panels:** Installed on your terrace to absorb sunlight and produce Direct Current (DC) power.
2. **Solar Inverter:** The "brain" of the setup that converts DC power into alternating current (AC) matching your household appliances and the utility grid.
3. **Bi-directional (Net) Meter:** Replaces your standard one-way meter to measure both energy imported from the grid and surplus energy exported back.
4. **Mounting Structures and Protections:** Elevated aluminum or galvanized iron structures, surge protection devices (SPD), AC/DC distribution boxes, and lightning arrestors.

---

## Key Terms Every Homeowner Should Know

* **Kilowatt (kW):** The metric of system power rating. A typical urban home installs a **3 kW to 5 kW** system.
* **Kilowatt-Hour (kWh / Unit):** The unit of electricity generation or consumption. 1 kWh powers a 1,000-watt appliance for 1 hour.
* **Capacity Utilization Factor (CUF):** The ratio of actual annual generation compared to theoretical 24/7 maximum output (typically 18% to 22% for solar).
    `,
  },
  {
    id: 'topic-2',
    slug: 'how-solar-panels-work',
    category: 'How Solar Panels Work',
    title: 'How Solar Panels Work',
    summary: 'A step-by-step beginner explanation of the photovoltaic effect, silicon cells, and how photons turn into home electricity.',
    readTime: '5 min read',
    icon: 'Zap',
    accentColor: 'from-[#2563EB] to-[#153B65]',
    tags: ['Photovoltaic Effect', 'Technology', 'Inverters'],
    content: `
## The Photovoltaic (PV) Effect Explained

Solar panels do not generate electricity from heat; they generate it directly from **light photons**. This magical physical process is called the **Photovoltaic (PV) Effect**, discovered in 1839 by Edmond Becquerel.

---

## Step-by-Step: From Sunlight to Your Appliances

### Step 1: Photons Strike the Silicon Wafers
A solar panel contains dozens of interconnected silicon semiconductor cells sandwiched beneath protective tempered glass. Silicon atoms have electrons bound in their crystalline lattice. When light particles (photons) penetrate the cell, their kinetic energy knocks electrons loose.

### Step 2: The P-N Junction Directs the Flow
Each silicon cell has two distinct layers:
* An **N-type layer** (doped with phosphorus) with extra free electrons.
* A **P-type layer** (doped with boron) with electron vacancies ("holes").
The boundary between them (the P-N junction) creates an internal electric field that forces freed electrons to travel in one unified direction, producing **Direct Current (DC)**.

### Step 3: Conductive Metal Ribbons Collect Current
Thin metallic contact lines (busbars and fingers) on the cell surface channel the rushing electrons into solar cables, creating a usable electric current.

### Step 4: The Solar Inverter Converts DC to AC
Your home fans, lights, refrigerators, and television sets operate exclusively on 230V alternating current (AC). The solar inverter converts raw DC power into synchronized, clean AC electricity matching your utility grid's frequency (50 Hz in India).

---

## Generation Lifecycle Throughout the Day

* **Morning (7:00 AM – 10:00 AM):** Solar production gently ramps up as sunlight angle improves.
* **Mid-Day Peak (11:00 AM – 2:30 PM):** Peak solar generation occurs when the Sun is directly perpendicular to panels.
* **Late Afternoon (3:00 PM – 6:00 PM):** Output tapers down with decreasing irradiance.
* **Night (6:00 PM – 6:00 AM):** Zero generation. Your home automatically draws power from the utility grid or stored batteries without any interruption.
    `,
  },
  {
    id: 'topic-3',
    slug: 'types-of-solar-panels',
    category: 'Types of Solar Panels',
    title: 'Types of Solar Panels: Mono vs Poly vs TOPCon',
    summary: 'Compare Monocrystalline, Polycrystalline, Bifacial, and next-generation TOPCon panels to choose the best fit for your roof.',
    readTime: '6 min read',
    icon: 'Layers',
    accentColor: 'from-[#38BDF8] to-[#0284C7]',
    tags: ['Hardware', 'Monocrystalline', 'Bifacial'],
    content: `
## Comparing Solar Panel Technologies

Selecting the right solar module depends on your available rooftop area, local temperature, and budget. Today, the global and Indian residential market is dominated by crystalline silicon technologies.

---

## 1. Monocrystalline Solar Panels (Mono-PERC)
Made from a single continuous pure silicon crystal ingot. Recognized by their sleek, uniform black appearance and rounded cell corners.

* **Efficiency:** High (20% – 22.5%)
* **Temperature Coefficient:** Superior performance in hot climates.
* **Space Needed:** Requires the smallest roof footprint (~70 sq. ft. per kW).
* **Verdict:** The standard choice for modern residential rooftops with limited space.

---

## 2. Next-Gen N-Type TOPCon Panels
Tunnel Oxide Passivated Contact (TOPCon) represents the latest solar innovation. They replace older P-type cells with higher-purity N-type silicon.

* **Efficiency:** Premium (22% – 24.5%)
* **Degradation:** Lower first-year degradation (<1%) and 0.4% annual degradation.
* **Bifacial Factor:** Often captures up to 10-25% extra reflected light from terrace flooring.
* **Verdict:** Ideal for modern villas and apartments maximizing long-term 25-year yields.

---

## 3. Polycrystalline Solar Panels
Made from melting multiple silicon fragments together. Easily recognized by their speckled blue mosaic appearance.

* **Efficiency:** Moderate (15% – 17.5%)
* **Space Needed:** Requires ~100 sq. ft. per kW.
* **Verdict:** Older technology; largely phased out for new residential installations in favor of Mono-PERC, but still found in older community plants.

---

## Quick Comparison Table

| Metric | Monocrystalline (Mono-PERC) | N-Type TOPCon | Polycrystalline |
|---|---|---|---|
| **Cell Color** | Uniform Black | Jet Black | Speckled Blue |
| **Typical Efficiency** | 20.5% – 22% | 22.5% – 24% | 16% – 17.5% |
| **Area per 1 kW** | ~65–75 sq. ft. | ~60–70 sq. ft. | ~95–110 sq. ft. |
| **Heat Tolerance** | Good | Excellent | Fair |
| **Warranty** | 25 Years Performance | 25–30 Years | 25 Years |
| **Relative Cost** | Standard | Slightly higher (+5-10%) | Budget / Phasing out |
    `,
  },
  {
    id: 'topic-4',
    slug: 'benefits-of-solar-energy',
    category: 'Benefits of Solar Energy',
    title: 'Benefits of Solar Energy for Households',
    summary: 'Explore how solar energy slashes electricity bills, shields against tariff hikes, and drastically cuts your household carbon footprint.',
    readTime: '4 min read',
    icon: 'Sparkles',
    accentColor: 'from-[#0284C7] to-[#1D4ED8]',
    tags: ['Savings', 'Environment', 'Financial ROI'],
    content: `
## Why Residential Solar is Booming

Installing rooftop solar is one of the very few home improvements that **pays for itself** and yields positive cash flow for over two decades.

---

## 1. Massive Financial Savings
* **60% to 90% Bill Reduction:** By generating your own clean power on-site, you eliminate high-tier grid unit purchases.
* **Hedge Against Tariff Inflation:** Electricity utility tariffs in India historically inflate by 3% to 6% annually. Your solar electricity cost remains fixed at ₹0 for 25 years.
* **Rapid Payback Period:** A typical grid-tied residential solar system in India recovers its entire capital expenditure within **3 to 5 years**. After that, all generated electricity is essentially free!

---

## 2. Real Environmental Impact
Every kilowatt-hour generated on your roof displaces coal-fired power from state thermal plants:
* **0.82 kg of CO₂ avoided** per 1 kWh of solar generation in India.
* A typical **3 kW system** producing ~4,000 kWh per year prevents **3.28 tonnes of greenhouse gas emissions annually**.
* Equivalent to planting **150+ mature trees** over a 20-year span.

---

## 3. Terrace Thermal Insulation
A lesser-known advantage: solar panels cast a protective shade canopy across your rooftop terrace. Studies show this shade reduces top-floor indoor ceiling temperatures by **2°C to 4°C**, lowering air-conditioner loads during intense summer months!
    `,
  },
  {
    id: 'topic-5',
    slug: 'solar-panel-installation-guide',
    category: 'Solar Panel Installation Guide',
    title: 'Solar Panel Installation Guide: Step-by-Step',
    summary: 'A complete walkthrough of rooftop feasibility, south-facing orientation, structural anchoring, and net-metering commissioning.',
    readTime: '7 min read',
    icon: 'Wrench',
    accentColor: 'from-[#0EA5E9] to-[#153B65]',
    tags: ['Installation', 'Checklist', 'Safety'],
    content: `
## Planning Your Solar Installation

A successful residential solar installation blends solid structural engineering with proper electrical safety standards.

---

## Step 1: Rooftop Feasibility Assessment
* **Shadow-Free Sun Window:** Your roof should receive unshaded sunlight between **9:00 AM and 4:00 PM**. Watch out for water tanks, elevator headrooms, and neighboring trees.
* **Roof Orientation:** In the Northern Hemisphere (including India), panels **must face True South** to maximize solar irradiance across all 12 months.
* **Tilt Angle:** Match the tilt angle to your city's latitude (e.g., ~13° in Bengaluru/Chennai, ~19° in Mumbai, ~28° in New Delhi) with a 2-3° drainage slope for rainwater runoff.

---

## Step 2: Selecting System Architecture
* **Grid-Tied (On-Grid):** Connects to your state electricity utility grid via net metering. No battery costs. Shuts down during power outages for lineman anti-islanding safety.
* **Hybrid:** Combines grid connectivity with lithium or lead-acid battery backup for seamless power during grid outages.
* **Off-Grid:** Completely autonomous battery setup, typically for remote farms or rural areas without reliable grid access.

---

## Step 3: Structural Mounting & Civil Work
* High-grade **aluminum or hot-dip galvanized iron (GI)** structures with minimum 80-micron coating to resist monsoon corrosion.
* Chemical anchor bolts or elevated concrete footings so terrace waterproofing remains 100% intact.

---

## Step 4: Electrical Safety & Commissioning
* **Dedicated Earthing:** Minimum 3 independent chemical earth pits (Inverter AC earthing, Panel DC body earthing, Lightning Arrestor).
* **Lightning Protection:** Class-B/C Surge Protective Devices (SPD) inside DC and AC distribution boxes.
* **Inspection & Net Meter:** DISCOM engineers inspect the plant, verify anti-islanding protection, and install a bi-directional generation/import meter.
    `,
  },
  {
    id: 'topic-6',
    slug: 'solar-panel-maintenance',
    category: 'Solar Panel Maintenance',
    title: 'Solar Panel Maintenance & Efficiency Care',
    summary: 'Keep your solar panels operating at peak efficiency with simple cleaning habits, inverter diagnostics, and preventive safety checks.',
    readTime: '5 min read',
    icon: 'ShieldCheck',
    accentColor: 'from-[#38BDF8] to-[#2563EB]',
    tags: ['Cleaning', 'Inspection', 'Troubleshooting'],
    content: `
## Maximizing 25-Year System Performance

Solar panels have no rotating shafts or moving gears, making them exceptionally reliable. However, routine upkeep ensures you do not forfeit 15% to 25% of your generation to dust and soiling!

---

## 1. Cleaning Guidelines
* **Frequency:** Once every 10 to 15 days in dusty suburban or urban settings; once monthly in coastal, cleaner areas.
* **Best Timing:** Clean **early in the morning before 8:00 AM** or in late evening. Cleaning midday can thermally shock hot solar glass.
* **Cleaning Technique:** Use clean soft tap water with a soft microfiber mop or sponge wiper. Never use wire brushes, scouring pads, or abrasive chemical detergents that can erode the anti-reflective glass coating.

---

## 2. Inverter Status Diagnostics
Your inverter dashboard or mobile app is your daily performance window:
* **Green Steady Light:** Normal synchronous power injection.
* **Flashing Green:** System ramping up or low irradiance early morning.
* **Red / Amber Error Code:** Error condition (e.g., PV over-voltage, isolation resistance fault, grid voltage out of limits). Note the error code and contact your empanelled vendor.

---

## 3. Semi-Annual Safety Checklist
1. Inspect earthing connections for corrosion or loose bonding.
2. Check MC4 solar connectors under modules to ensure cables remain secured off the wet terrace floor.
3. Check concrete ballast points for any structural shifting after severe storms.
    `,
  },
  {
    id: 'topic-7',
    slug: 'cost-and-savings',
    category: 'Solar Energy Cost and Savings',
    title: 'Solar Energy Cost, Tariffs, and Savings Calculations',
    summary: 'Understand the exact mathematics of solar financial returns, self-consumption vs export credits, and payback calculation.',
    readTime: '6 min read',
    icon: 'DollarSign',
    accentColor: 'from-[#2563EB] to-[#1D4ED8]',
    tags: ['Finance', 'Tariffs', 'Payback Period'],
    content: `
## Demystifying Solar Economics

Many consumers assume financial savings equal total solar generation multiplied by their electricity tariff. In reality, savings depend on **how and when** you consume that energy.

---

## The Core Mathematical Formulas

### 1. Solar Utilized (In-Home Consumption)
$$\\text{Solar Utilized (kWh)} = \\text{Solar Generated} - \\text{Grid Export}$$

If you generate 22 kWh and export 6 kWh back to the grid during the day, your in-home utilization is **16 kWh**.

### 2. Direct Bill Savings
$$\\text{Direct Savings (₹)} = \\text{Solar Utilized (kWh)} \\times \\text{Retail Electricity Tariff (₹/kWh)}$$

At an average urban residential tariff of **₹7.50 / kWh**, 16 kWh utilized saves you **₹120.00** on that single day.

### 3. Net Metering Billing Credit
Surplus exported power flows through your bidirectional meter. Depending on your state's DISCOM policy:
* **Net Metering:** Exported units offset imported grid units on a 1:1 basis during billing reconciliation.
* **Net Billing / Gross Metering:** Exported units are credited at a predetermined PPA rate (e.g., ₹2.50 to ₹3.50/kWh) as set by the State Electricity Regulatory Commission (SERC).

---

## Payback Period Estimation
$$\\text{Payback Period (Years)} = \\frac{\\text{Net System Cost (after subsidies)}}{\\text{Annual Electricity Cost Avoided}}$$

For a typical 3 kW system with an initial capital investment around ₹1.5L to ₹1.8L (after government subsidies), producing ~4,200 units annually at ₹7.50/kWh saves ~₹31,500/year, providing an attractive **payback period under 5 years** followed by 20+ years of free energy!
    `,
  },
  {
    id: 'topic-8',
    slug: 'government-solar-schemes-india',
    category: 'Government Solar Schemes in India',
    title: 'Government Solar Schemes in India: PM Surya Ghar & Subsidies',
    summary: 'Official information on PM Surya Ghar: Muft Bijli Yojana, national portal registration, DISCOM approvals, and verification guidance.',
    readTime: '8 min read',
    icon: 'Building',
    accentColor: 'from-[#0284C7] to-[#153B65]',
    tags: ['PM Surya Ghar', 'MNRE', 'Official Schemes', 'Government'],
    content: `
## Official Government Initiatives for Rooftop Solar

The Government of India, through the **Ministry of New and Renewable Energy (MNRE)**, actively promotes residential rooftop solar adoption through standardized Central Financial Assistance (CFA) programs.

---

## 1. PM Surya Ghar: Muft Bijli Yojana

Launched by the Government of India in February 2024, the **PM Surya Ghar: Muft Bijli Yojana** aims to illuminate 1 crore (10 million) households across the country with rooftop solar installations.

### Official Central Financial Assistance (CFA) Guidelines:
Under current central guidelines notified by MNRE:
* **For systems up to 2 kW capacity:** ₹30,000 per kW (up to ₹60,000 total for 2 kW).
* **For additional capacity between 2 kW and 3 kW:** ₹18,000 per additional kW (e.g., ₹60,000 + ₹18,000 = ₹78,000 for a 3 kW system).
* **For systems above 3 kW capacity:** Capped at a maximum central subsidy of **₹78,000**.
* **Group Housing Societies / RWAs (Residential Welfare Associations):** ₹18,000 per kW for common facilities (such as common lighting, water pumps, EV chargers), capped up to 500 kW.

> **Important Verification Advisory:**
> Subsidy caps, state-specific top-up incentives, vendor empanelment, and technical guidelines are subject to periodic circulars issued by MNRE and State Electricity Regulatory Commissions (SERCs). Homeowners should **always verify live numbers** directly on the official national portal:
> **Official National Portal:** [https://pmsuryaghar.gov.in](https://pmsuryaghar.gov.in)
> **Ministry Website:** [https://mnre.gov.in](https://mnre.gov.in)

---

## 2. Official Application Workflow

All residential consumers in India must apply through the standardized single-window digital process:

1. **Consumer Registration:** Register on [pmsuryaghar.gov.in](https://pmsuryaghar.gov.in) selecting your State, Electricity Distribution Company (DISCOM), and Consumer Account Number.
2. **Technical Feasibility Approval (TFR):** Your local DISCOM reviews your transformer capacity and sanctions technical clearance.
3. **Installation by Empanelled Vendor:** Select a registered vendor who installs approved Domestic Content Requirement (DCR) certified solar modules.
4. **Net-Meter Inspection & Commissioning Certificate:** DISCOM inspectors verify earthing and anti-islanding before commissioning the bidirectional meter.
5. **Direct Benefit Transfer (DBT):** The approved subsidy amount is credited directly into the applicant's bank account within 30 days of certificate issuance.

---

## 3. Important Rules to Protect Yourself

* **DCR Compliant Modules Mandatory:** To qualify for central government subsidies, modules must be manufactured in India using Indian solar cells (Domestic Content Requirement).
* **Authorized Vendors Only:** Never pay unverified third parties. Always contract vendors officially listed on the national portal.
* **No Subsidy on Batteries:** Central rooftop solar subsidies apply strictly to grid-tied setups without battery storage components.
    `,
  },
  {
    id: 'topic-9',
    slug: 'solar-faqs',
    category: 'Frequently Asked Questions',
    title: 'Frequently Asked Questions (FAQs)',
    summary: 'Answers to the most common beginner questions about cloudy days, power outages, roof damage, and panel lifespans.',
    readTime: '6 min read',
    icon: 'HelpCircle',
    accentColor: 'from-[#60A5FA] to-[#2563EB]',
    tags: ['FAQ', 'Common Queries', 'Troubleshooting'],
    content: `
## Frequently Asked Questions by Homeowners

Here are clear, honest answers to the questions most commonly asked by community residents considering solar energy.

---

### Q1: What happens during monsoon or heavy cloud cover?
Solar panels generate electricity from diffused daylight, not direct heat. While maximum power occurs under clear blue skies, modern monocrystalline panels continue to produce **15% to 35% of their rated output** on overcast and rainy days. Your grid connection automatically supplies whatever difference your home requires.

---

### Q2: Why does my on-grid solar system turn off during power cuts?
For electrical worker safety. If your on-grid inverter continued injecting electricity into the local utility lines during a blackout, it could fatally shock utility linemen repairing the grid wires. This safety mechanism is legally required and called **Anti-Islanding Protection**. If you need power during outages, you can choose a **Hybrid Inverter** with battery storage.

---

### Q3: Will installing solar panels cause terrace roof leakage?
Not when executed by qualified vendors. Professional installers use non-penetrating concrete ballasts or chemical epoxy anchor fasteners with dual-layer waterproofing sealant rings around every bolt hole. Your terrace waterproofing remains completely intact.

---

### Q4: How long do solar panels actually last?
High-grade Tier-1 solar modules come with a **25-year linear performance warranty**. Silicon does not mechanically wear out. On average, panels degrade by only ~0.5% per year, meaning after 25 years, your system will still operate at approximately **85% to 88% of its initial rated capacity**.

---

### Q5: How much roof space do I need for a 3 kW solar plant?
A modern 3 kW plant uses 6 to 7 high-efficiency panels (540W to 580W each). You need approximately **180 to 220 square feet** of shadow-free rooftop terrace area facing south.
    `,
  },
]

