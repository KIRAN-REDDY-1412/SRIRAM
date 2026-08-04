export const pricingPlans = [
  {
    id: "plan_basic",
    name: "Basic",
    tagline: "Essential ERP for single department setup",
    price: "$1,200",
    period: "/ year",
    studentLimit: "Up to 200 Students",
    badge: "Startup Tier",
    isPopular: false,
    features: [
      "Clinical Case Collection Engine",
      "Standard Preceptor Approvals",
      "Basic Academic Reports",
      "Up to 15 Faculty Accounts",
      "Standard Cloud Storage (50GB)",
      "Email & Chat Support"
    ],
    ctaText: "Register Basic College",
    accentColor: "border-slate-200 dark:border-slate-800"
  },
  {
    id: "plan_pro",
    name: "Professional",
    tagline: "Complete clinical ERP for growing pharmacy colleges",
    price: "$2,800",
    period: "/ year",
    studentLimit: "Up to 600 Students",
    badge: "Most Popular",
    isPopular: true,
    features: [
      "Everything in Basic",
      "AI Clinical Assistant & Case Validation",
      "Multi-Hospital Preceptor Network",
      "Automated NAAC / NIRF Analytics",
      "Unlimited Faculty & Preceptor Accounts",
      "High-Priority 24/7 Dedicated Support",
      "Custom ERP Integrations & API Access"
    ],
    ctaText: "Register Professional College",
    accentColor: "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20"
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    tagline: "Tailored multi-campus & university consortium platform",
    price: "Custom",
    period: "annual contract",
    studentLimit: "Unlimited Students",
    badge: "Multi-Campus",
    isPopular: false,
    features: [
      "Everything in Professional",
      "Multi-College Consortium Dashboard",
      "Dedicated Private Cloud & On-Prem Options",
      "Custom Clinical Workflow Builder",
      "Dedicated Technical Account Manager",
      "99.95% SLA & HIPAA / Data Compliance",
      "Custom SSO (SAML 2.0 / OAuth2)"
    ],
    ctaText: "Register Enterprise College",
    accentColor: "border-cyan-500 dark:border-cyan-400"
  }
];
