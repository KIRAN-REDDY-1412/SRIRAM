/**
 * Comprehensive Realistic Sample Clinical Case Data for PDF & PPT Template Previews.
 * Includes data for all clinical documentation modules.
 */
export const SAMPLE_CLINICAL_CASE_DATA = {
  clinicalCase: {
    id: 'sample-case-uuid-0001',
    case_id: 'AMRMCP-2026-000001',
    department: 'Gastroenterology & General Medicine',
    status: 'Approved',
    overall_case_status: 'Approved',
    submitted_at: '2026-08-05T10:30:00Z',
    approved_at: '2026-08-06T14:15:00Z',
    diagnosis: 'Inflammatory Bowel Disease (IBD) with Terminal Ileitis & Secondary Anemia',
    final_diagnosis: 'Inflammatory Bowel Disease (IBD) with Terminal Ileitis & Secondary Anemia'
  },
  student: {
    full_name: 'Kiran Reddy',
    roll_number: 'Y22PHD0314',
    id: 'student-uuid-001',
    department: 'Pharm.D (Doctor of Pharmacy)',
    batch: '2022-2028'
  },
  preceptor: {
    full_name: 'Dr. A. Sharma, M.D.',
    designation: 'Associate Professor & Clinical Preceptor',
    department: 'General Medicine & Gastroenterology'
  },
  college: {
    college_name: 'Pharmacy College',
    name: 'Pharmacy College',
    is_autonomous: true,
    isAutonomous: true,
    hospital_name: 'Primary Teaching Hospital',
    hospitalName: 'Primary Teaching Hospital',
    college_logo_url: '',
    hospital_logo_url: ''
  },
  caseModulesData: {
    profile: {
      patient_name: 'John Doe',
      age: '46',
      gender: 'Male',
      ip_op_number: 'IP-987654',
      ward: 'Male Medical Ward (Unit-3, Bed 12)',
      department: 'Gastroenterology & General Medicine',
      attending_physician: 'Dr. N. Rajesh, M.D. (Gastroenterologist)',
      date_of_admission: '2026-08-01',
      chief_complaints: 'Severe lower right quadrant abdominal pain during defecation for 3 days, accompanied by low-grade fever (100.4°F), 4-5 episodes of watery diarrhea per day, and generalized fatigue.',
      past_medical_history: 'Hypertension (5 yrs, managed on Telmisartan 40mg), Type 2 Diabetes Mellitus (3 yrs, managed on Metformin 500mg), Appendectomy P/S (2018).',
      past_medication_history: 'Tab. Telmisartan 40mg PO OD (Morning), Tab. Metformin 500mg PO BD (After meals). No history of long-term NSAID usage.',
      family_history: 'Father had T2DM and Hypertension. No reported family history of Inflammatory Bowel Disease, Colorectal Malignancy, or Autoimmune Disorders.',
      social_history: 'Marital Status: Married | Occupation: School Teacher | Non-smoker, Non-alcoholic | Mixed diet, moderate physical activity.',
      general_examination: 'Patient conscious, coherent, oriented to time, place, and person. Pallor: Present (+), Cyanosis: Absent, Icterus: Absent, Clubbing: Absent, Pedal Edema: Absent. Hydration: Mildly dehydrated.',
      systemic_examination: 'CVS: S1, S2 heard, no murmurs. RS: Bilateral air entry equal, clear vesicular breath sounds. GI: Abdomen soft, tenderness (+) in Right Iliac Fossa (RIF), no organomegaly, bowel sounds hyperactive. CNS: Intact, HMF normal.',
      diagnosis: 'Inflammatory Bowel Disease (IBD) with Terminal Ileitis & Secondary Anemia',
      other_investigations: 'US SCAN OF WHOLE ABDOMEN: Wall thickening noted in terminal ileum (4.2mm) with prominent mesenteric lymph nodes. COLONOSCOPY & HISTOPATHOLOGY REPORT: Focal mucosal ulceration and transmural lymphoid aggregates consistent with Terminal Ileitis (Crohn\'s Disease pattern). CHEST X-RAY: Normal lung parenchyma.',
      discharge_summary: 'Patient admitted with severe RIF abdominal pain and chronic diarrhea. Diagnostic colonoscopy and histopathology confirmed Terminal Ileitis. Initialized IV corticosteroids, oral Mesalamine, and supportive rehydration therapy. Symptoms significantly subsided with stool frequency normalized to 1-2 soft stools/day. Discharged in hemodynamically stable condition with oral maintenance therapy and dietary guidance.'
    },
    vitals: [
      { date: '2026-08-01', temp: '100.4', bp: '130/85', pr: '88', rr: '20', spo2: '98' },
      { date: '2026-08-02', temp: '99.2', bp: '124/80', pr: '82', rr: '18', spo2: '98' },
      { date: '2026-08-03', temp: '98.6', bp: '120/78', pr: '76', rr: '18', spo2: '99' },
      { date: '2026-08-04', temp: '98.4', bp: '118/76', pr: '72', rr: '16', spo2: '99' }
    ],
    labs: [
      { category: 'Haematology', parameter_name: 'Hemoglobin (Hb)', test_value: '10.2', unit: 'g/dL', reference_range: '13.0 - 17.0 g/dL', clinical_inference: 'Microcytic Hypochromic Anemia' },
      { category: 'Haematology', parameter_name: 'Total WBC Count', test_value: '13,500', unit: '/cu.mm', reference_range: '4,000 - 11,000 /cu.mm', clinical_inference: 'Leukocytosis (Inflammatory response)' },
      { category: 'Haematology', parameter_name: 'Erythrocyte Sedimentation Rate (ESR)', test_value: '42', unit: 'mm/hr', reference_range: '0 - 15 mm/hr', clinical_inference: 'Elevated Inflammatory Marker' },
      { category: 'Biochemistry', parameter_name: 'C-Reactive Protein (CRP)', test_value: '28.5', unit: 'mg/L', reference_range: '0 - 5.0 mg/L', clinical_inference: 'Markedly Elevated Inflammatory Marker' },
      { category: 'Biochemistry', parameter_name: 'Random Blood Sugar (RBS)', test_value: '154', unit: 'mg/dL', reference_range: '70 - 140 mg/dL', clinical_inference: 'Mild Glycemic Elevation' },
      { category: 'Biochemistry', parameter_name: 'Serum Creatinine', test_value: '0.9', unit: 'mg/dL', reference_range: '0.7 - 1.3 mg/dL', clinical_inference: 'Normal Renal Function' },
      { category: 'Electrolytes', parameter_name: 'Serum Sodium (Na+)', test_value: '136', unit: 'mEq/L', reference_range: '135 - 145 mEq/L', clinical_inference: 'Normal Electrolyte Level' },
      { category: 'Electrolytes', parameter_name: 'Serum Potassium (K+)', test_value: '3.8', unit: 'mEq/L', reference_range: '3.5 - 5.0 mEq/L', clinical_inference: 'Normal Electrolyte Level' }
    ],
    drugs: [
      { s_no: 1, trade_name: 'Inj. Hydrocortisone', generic_name: 'Hydrocortisone Sodium Succinate', dose: '100 mg', route_of_admin: 'IV', frequency: 'TID (Q8H)', indication: 'Acute IBD Exacerbation' },
      { s_no: 2, trade_name: 'Tab. Mesalamine (Pentasa)', generic_name: 'Mesalazine / 5-ASA', dose: '1.2 g', route_of_admin: 'Oral', frequency: 'BD (Q12H)', indication: 'Terminal Ileitis Anti-inflammatory' },
      { s_no: 3, trade_name: 'Tab. Pantoprazole (Pan-40)', generic_name: 'Pantoprazole Sodium', dose: '40 mg', route_of_admin: 'Oral', frequency: 'OD (Before Food)', indication: 'Gastroprotection / PPI' },
      { s_no: 4, trade_name: 'Tab. Telmisartan (Telma-40)', generic_name: 'Telmisartan', dose: '40 mg', route_of_admin: 'Oral', frequency: 'OD (Morning)', indication: 'Hypertension Management' },
      { s_no: 5, trade_name: 'Tab. Metformin (Glycomet-500)', generic_name: 'Metformin HCl', dose: '500 mg', route_of_admin: 'Oral', frequency: 'BD (After Food)', indication: 'Glycemic Control' },
      { s_no: 6, trade_name: 'Cap. Ferrous Fumarate + Folic Acid', generic_name: 'Iron + Folic Acid Supplement', dose: '200 mg', route_of_admin: 'Oral', frequency: 'OD (Post Meals)', indication: 'Anemia Management' }
    ],
    counselling: {
      counselling_provided_to: 'Patient & Spouse',
      counselling_mode: 'Oral Interaction & Pictorial Dosage Leaflet',
      time_taken: '20 minutes',
      disease_counselled: 'Inflammatory Bowel Disease (Terminal Ileitis)',
      medications_counselled: 'Mesalamine 1.2g BD, Hydrocortisone tapering, Pantoprazole 40mg, Iron supplements.',
      focus_points: 'Explained strict adherence to oral 5-ASA therapy, necessity of completing steroid step-down schedule, monitoring for black tarry stools or blood in diarrhea, maintaining high-protein low-residue diet during flares, and avoiding self-medication with NSAIDs (e.g., Ibuprofen) which exacerbate gut inflammation.',
      barriers_action: 'Patient expressed anxiety regarding chronic illness duration. Reassured with educational pamphlet on long-term IBD remission strategies.'
    },
    intervention: {
      problem_identified: 'Potential drug interaction between oral Iron supplement (Ferrous Fumarate) and Mesalamine (5-ASA), resulting in chelation and decreased bioavailability of both agents.',
      intervention_provided: 'Recommended spacing the administration of Tab. Mesalamine and Cap. Ferrous Fumarate by at least 2 hours to prevent competitive gastrointestinal binding.',
      physician_acceptance: 'Discussed with attending gastroenterologist Dr. N. Rajesh, M.D. Recommendation accepted immediately; nursing schedule modified accordingly.',
      outcome: 'Optimized absorption of anti-inflammatory therapy and corrected anemia without digestive distress.'
    },
    dir: {
      enquirer_name: 'Dr. N. Rajesh, M.D.',
      enquirer_category: 'Physician / Gastroenterologist',
      mode_of_request: 'Direct Verbal Inquiry during Morning Ward Rounds',
      date_of_request: '2026-08-02',
      details_of_enquiry: 'What is the recommended corticosteroid tapering regimen following acute IV Hydrocortisone stabilization in moderate Terminal Ileitis (Crohn\'s disease)?',
      sources_consulted: 'Micromedex Clinical Knowledge, UpToDate Clinical Guidelines (2026), ECCO Guidelines for Crohn\'s Disease Management.',
      information_provided: 'Provided evidence-based guidelines: Transition from IV Hydrocortisone 100mg TID to Oral Prednisolone 40mg/day as a single morning dose, tapering by 5mg weekly over 8 weeks while maintaining full-dose oral Mesalamine (2.4g/day).'
    },
    adr: {
      adr_number: 'ADR-2026-00042',
      suspected_drug: 'Tab. Metformin 500mg',
      reaction_title: 'Mild Postprandial Abdominal Cramping & Metallic Taste',
      date_of_onset: '2026-08-02',
      naranjo_score: '6 (Probable Causality)',
      initial_causality_opinion: 'Probable',
      severity_rating: 'Mild (Grade 1)',
      action_taken_on_suspected_drug: 'Dose timing shifted to strictly mid-meal; continued without discontinuation.',
      patient_outcome: 'Recovered completely by Day 3 without adverse systemic effects.'
    }
  }
};

/**
 * Returns dynamic sample clinical case data pre-populated with the specific college's identity.
 */
export const getSampleCaseDataForCollege = (collegeObj = {}) => {
  const collegeName = collegeObj?.college_name || collegeObj?.name || 'Pharmacy College';
  const hospitalName = collegeObj?.hospital_name || collegeObj?.hospitalName || collegeObj?.primary_hospital_name || 'Primary Teaching Hospital';
  const collegeLogoUrl = collegeObj?.college_logo_url || collegeObj?.logoUrl || collegeObj?.logo_url || '';
  const hospitalLogoUrl = collegeObj?.hospital_logo_url || collegeObj?.hospitalLogoUrl || '';
  const isAutonomous = Boolean(collegeObj?.is_autonomous ?? collegeObj?.isAutonomous);

  return {
    ...SAMPLE_CLINICAL_CASE_DATA,
    college: {
      ...SAMPLE_CLINICAL_CASE_DATA.college,
      id: collegeObj?.id || SAMPLE_CLINICAL_CASE_DATA.college.id,
      college_name: collegeName,
      name: collegeName,
      hospital_name: hospitalName,
      hospitalName: hospitalName,
      college_logo_url: collegeLogoUrl,
      logoUrl: collegeLogoUrl,
      hospital_logo_url: hospitalLogoUrl,
      hospitalLogoUrl: hospitalLogoUrl,
      is_autonomous: isAutonomous,
      isAutonomous: isAutonomous
    }
  };
};
