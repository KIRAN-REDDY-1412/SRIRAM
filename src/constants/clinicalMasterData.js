// Centralized Master Data for Hospital Departments & Clinical Wards/Units

export const CLINICAL_DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Nephrology',
  'Pulmonology',
  'Gastroenterology',
  'Endocrinology',
  'Rheumatology',
  'Oncology',
  'Hematology',
  'Dermatology',
  'Psychiatry',
  'Pediatrics',
  'Neonatology',
  'Obstetrics & Gynaecology (OBG)',
  'Orthopaedics',
  'General Surgery',
  'Plastic Surgery',
  'Cardiothoracic Surgery (CTVS)',
  'Neurosurgery',
  'Urology',
  'ENT (Otorhinolaryngology)',
  'Ophthalmology',
  'Emergency Medicine (Casualty)',
  'Intensive Care Unit (ICU)',
  'Anaesthesiology',
  'Clinical Pharmacology',
  'Pharmacy Practice'
];

export const CLINICAL_WARDS_UNITS = [
  // General Wards
  { label: 'Male Medical Ward', value: 'Male Medical Ward', category: 'General Wards' },
  { label: 'Female Medical Ward', value: 'Female Medical Ward', category: 'General Wards' },
  { label: 'General Medical Ward', value: 'General Medical Ward', category: 'General Wards' },
  { label: 'Male Surgical Ward', value: 'Male Surgical Ward', category: 'General Wards' },
  { label: 'Female Surgical Ward', value: 'Female Surgical Ward', category: 'General Wards' },
  { label: 'General Surgical Ward', value: 'General Surgical Ward', category: 'General Wards' },

  // Critical Care
  { label: 'Medical ICU (MICU)', value: 'Medical ICU (MICU)', category: 'Critical Care' },
  { label: 'Surgical ICU (SICU)', value: 'Surgical ICU (SICU)', category: 'Critical Care' },
  { label: 'Cardiac ICU (CCU)', value: 'Cardiac ICU (CCU)', category: 'Critical Care' },
  { label: 'Neuro ICU (NICU)', value: 'Neuro ICU (NICU)', category: 'Critical Care' },
  { label: 'Pediatric ICU (PICU)', value: 'Pediatric ICU (PICU)', category: 'Critical Care' },
  { label: 'Neonatal ICU (NICU)', value: 'Neonatal ICU (NICU)', category: 'Critical Care' },
  { label: 'Burn ICU', value: 'Burn ICU', category: 'Critical Care' },
  { label: 'Trauma ICU', value: 'Trauma ICU', category: 'Critical Care' },

  // Specialty Wards
  { label: 'Cardiology Ward', value: 'Cardiology Ward', category: 'Specialty Wards' },
  { label: 'Neurology Ward', value: 'Neurology Ward', category: 'Specialty Wards' },
  { label: 'Nephrology Ward', value: 'Nephrology Ward', category: 'Specialty Wards' },
  { label: 'Pulmonology Ward', value: 'Pulmonology Ward', category: 'Specialty Wards' },
  { label: 'Gastroenterology Ward', value: 'Gastroenterology Ward', category: 'Specialty Wards' },
  { label: 'Oncology Ward', value: 'Oncology Ward', category: 'Specialty Wards' },
  { label: 'Hematology Ward', value: 'Hematology Ward', category: 'Specialty Wards' },
  { label: 'Orthopaedic Ward', value: 'Orthopaedic Ward', category: 'Specialty Wards' },
  { label: 'Urology Ward', value: 'Urology Ward', category: 'Specialty Wards' },
  { label: 'Obstetrics Ward', value: 'Obstetrics Ward', category: 'Specialty Wards' },
  { label: 'Gynaecology Ward', value: 'Gynaecology Ward', category: 'Specialty Wards' },
  { label: 'Pediatric Ward', value: 'Pediatric Ward', category: 'Specialty Wards' },
  { label: 'Psychiatry Ward', value: 'Psychiatry Ward', category: 'Specialty Wards' },
  { label: 'Dermatology Ward', value: 'Dermatology Ward', category: 'Specialty Wards' },

  // Other Units
  { label: 'Emergency Department', value: 'Emergency Department', category: 'Other Units' },
  { label: 'Casualty', value: 'Casualty', category: 'Other Units' },
  { label: 'Observation Ward', value: 'Observation Ward', category: 'Other Units' },
  { label: 'Dialysis Unit', value: 'Dialysis Unit', category: 'Other Units' },
  { label: 'Chemotherapy Day Care', value: 'Chemotherapy Day Care', category: 'Other Units' },
  { label: 'Operation Theatre (OT)', value: 'Operation Theatre (OT)', category: 'Other Units' },
  { label: 'Recovery Room', value: 'Recovery Room', category: 'Other Units' }
];
