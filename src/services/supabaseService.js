import { supabase } from '../lib/supabaseClient';

/**
 * SHA-256 Password Hashing Helper
 * Uses Web Crypto API (SubtleCrypto) compatible with Browser and Node.js
 */
export const hashPassword = async (password) => {
  if (!password) return null;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Password hashing error:', err);
    return null;
  }
};

/**
 * Upload profile photo to Supabase Storage bucket 'profile-photos' (100 KB max limit)
 */
export const uploadProfilePhotoToSupabaseStorage = async (file, folder = 'profiles') => {
  if (!file) return { success: false, error: 'No file provided' };

  if (file.size > 100 * 1024) {
    return { success: false, error: 'File size exceeds 100 KB limit. Please choose a smaller image.' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { success: false, error: 'Invalid file format. Only JPG, JPEG, and PNG images are allowed.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ success: true, url: reader.result });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ success: true, url: reader.result });
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Upload college logo file to Supabase Storage bucket 'college-logos' (500 KB limit)
 */
export const uploadCollegeLogoToSupabaseStorage = async (file) => {
  if (!file) return { success: false, error: 'No file provided' };

  if (file.size > 500 * 1024) {
    return { success: false, error: 'File size exceeds 500 KB limit. Please choose a smaller image.' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { success: false, error: 'Invalid file format. Only JPG, JPEG, and PNG images are allowed.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('college-logos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ success: true, url: reader.result });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('college-logos')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ success: true, url: reader.result });
      reader.readAsDataURL(file);
    });
  }
};

// ====================================================================
// COLLEGE FETCH SERVICE
// ====================================================================

export const fetchCollegeByIdFromSupabase = async (collegeId) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', collegeId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, college: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// DOCUMENT BRANDING SERVICES
// ====================================================================

export const fetchDocumentBrandingSettingsFromSupabase = async (collegeId) => {
  try {
    const { data, error } = await supabase
      .from('document_branding_settings')
      .select('*')
      .eq('college_id', collegeId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, settings: data || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveOrUpdateDocumentBrandingSettingsInSupabase = async (collegeId, settingsPayload) => {
  try {
    const { data: existing } = await supabase
      .from('document_branding_settings')
      .select('id')
      .eq('college_id', collegeId)
      .maybeSingle();

    const payload = {
      college_id: collegeId,
      show_college_logo: settingsPayload.show_college_logo ?? true,
      show_college_name: settingsPayload.show_college_name ?? true,
      show_autonomous: settingsPayload.show_autonomous ?? true,
      show_hospital_logo: settingsPayload.show_hospital_logo ?? true,
      show_hospital_name: settingsPayload.show_hospital_name ?? true,
      watermark_enabled: settingsPayload.watermark_enabled ?? true,
      watermark_text_line1: settingsPayload.watermark_text_line1 || 'PHARMDVERSE',
      watermark_text_line2: settingsPayload.watermark_text_line2 || 'Clinical Documentation System',
      watermark_opacity: parseInt(settingsPayload.watermark_opacity, 10) || 10,
      watermark_position: settingsPayload.watermark_position || 'Center',
      footer_left_text: settingsPayload.footer_left_text || 'PharmDVerse',
      footer_center_text: settingsPayload.footer_center_text || 'Confidential Clinical Documentation',
      show_page_number: settingsPayload.show_page_number ?? true,
      show_generated_datetime: settingsPayload.show_generated_datetime ?? true,
      paper_size: settingsPayload.paper_size || 'A4',
      orientation: settingsPayload.orientation || 'Portrait',
      margin_top: settingsPayload.margin_top || '15mm',
      margin_bottom: settingsPayload.margin_bottom || '15mm',
      margin_left: settingsPayload.margin_left || '15mm',
      margin_right: settingsPayload.margin_right || '15mm',
      font_family: settingsPayload.font_family || 'Times New Roman',
      title_font_size: settingsPayload.title_font_size || '18pt',
      heading_font_size: settingsPayload.heading_font_size || '14pt',
      body_font_size: settingsPayload.body_font_size || '12pt',
      primary_color: settingsPayload.primary_color || '#0f172a',
      secondary_color: settingsPayload.secondary_color || '#0284c7',
      table_header_color: settingsPayload.table_header_color || '#f1f5f9',
      border_color: settingsPayload.border_color || '#0f172a',
      text_color: settingsPayload.text_color || '#0f172a',
      zebra_striping: settingsPayload.zebra_striping ?? false,
      repeat_table_header: settingsPayload.repeat_table_header ?? true,
      show_student_signature: settingsPayload.show_student_signature ?? true,
      show_preceptor_signature: settingsPayload.show_preceptor_signature ?? true
    };

    let savedData = null;
    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('document_branding_settings')
        .update(payload)
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    } else {
      const { data, error } = await supabase
        .from('document_branding_settings')
        .insert([payload])
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    }

    return { success: true, settings: savedData };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// ADR DOCUMENTATION SERVICES (SINGLE CONSOLIDATED TABLE)
// ====================================================================

export const generateUniqueAdrNumberInSupabase = async (collegeCode = 'AMRMCP') => {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `ADR-${currentYear}-`;

    const { data, error } = await supabase
      .from('adr_reports')
      .select('adr_number')
      .like('adr_number', `${prefix}%`)
      .order('adr_number', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0 && data[0].adr_number) {
      const lastId = data[0].adr_number;
      const parts = lastId.split('-');
      if (parts.length === 3) {
        const parsedNum = parseInt(parts[2], 10);
        if (!isNaN(parsedNum)) nextNumber = parsedNum + 1;
      }
    }

    const formattedSequence = String(nextNumber).padStart(6, '0');
    return { success: true, adrNumber: `${prefix}${formattedSequence}` };
  } catch (err) {
    return { success: false, adrNumber: `ADR-2026-000001` };
  }
};

export const fetchADRReportByCaseIdFromSupabase = async (clinicalCaseId) => {
  try {
    const { data: report, error } = await supabase
      .from('adr_reports')
      .select('*')
      .eq('clinical_case_id', clinicalCaseId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!report) return { success: true, report: null, suspectedMeds: [], concomitantMeds: [], attachments: [] };

    return {
      success: true,
      report,
      suspectedMeds: report.suspected_medications || [],
      concomitantMeds: report.concomitant_medications || [],
      attachments: report.attachments || []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveOrUpdateADRReportInSupabase = async (masterPayload, suspectedMeds = [], concomitantMeds = [], attachments = []) => {
  try {
    const VALID_ADR_COLS = new Set([
      'id', 'created_at', 'updated_at', 'clinical_case_id', 'student_id', 'college_id',
      'adr_number', 'reporting_date', 'reported_by_student_name', 'assigned_preceptor_name',
      'patient_initials', 'hospital_reg_number', 'age', 'gender', 'weight', 'department', 'ward',
      'primary_diagnosis', 'reaction_title', 'reaction_category', 'reaction_description',
      'reaction_started_at', 'reaction_ended_at', 'reaction_duration',
      'clinical_management_provided', 'current_patient_condition', 'drug_allergy_history',
      'previous_adr_history', 'relevant_medical_conditions', 'pregnancy_lactation_status',
      'renal_status', 'hepatic_status', 'lifestyle_factors', 'additional_clinical_notes',
      'reaction_severity', 'reaction_seriousness', 'patient_outcome',
      'action_taken_on_suspected_drug', 'rechallenge_information', 'dechallenge_information',
      'initial_causality_opinion', 'clinical_remarks', 'student_remarks', 'preceptor_review',
      'faculty_comments', 'approval_status', 'suspected_medications', 'concomitant_medications', 'attachments'
    ]);

    const fullPayloadRaw = {
      ...masterPayload,
      suspected_medications: suspectedMeds,
      concomitant_medications: concomitantMeds,
      attachments: attachments
    };

    const fullPayload = {};
    Object.keys(fullPayloadRaw).forEach(k => {
      if (VALID_ADR_COLS.has(k)) fullPayload[k] = fullPayloadRaw[k];
    });

    const { data: existing } = await supabase
      .from('adr_reports')
      .select('id')
      .eq('clinical_case_id', masterPayload.clinical_case_id)
      .maybeSingle();

    let savedReport = null;

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('adr_reports')
        .update(fullPayload)
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      savedReport = data[0];
    } else {
      const { data, error } = await supabase
        .from('adr_reports')
        .insert([fullPayload])
        .select();

      if (error) return { success: false, error: error.message };
      savedReport = data[0];
    }

    return { success: true, report: savedReport };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// DRUG INFORMATION REQUEST SERVICES
// ====================================================================

export const fetchDrugInformationRequestByCaseIdFromSupabase = async (clinicalCaseId) => {
  try {
    const { data: request, error } = await supabase
      .from('drug_information_requests')
      .select('*')
      .eq('clinical_case_id', clinicalCaseId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, request: request || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveOrUpdateDrugInformationRequestInSupabase = async (payload) => {
  try {
    const VALID_DIR_COLS = new Set([
      'id', 'created_at', 'updated_at', 'clinical_case_id', 'student_id', 'college_id',
      'request_date', 'request_time', 'enquirer_name', 'designation', 'phone_no', 'unit_ward',
      'professional_status', 'professional_status_other', 'mode_of_request', 'answer_needed',
      'details_of_enquiry', 'question_category', 'purpose_of_enquiry', 'purpose_other',
      'age', 'sex', 'weight_kg', 'allergies', 'current_medical_problem', 'is_pregnant_lactating',
      'pregnancy_lactation_details', 'other_investigations', 'drug_therapy',
      'answer_given_timeframe', 'reason_for_delay', 'mode_of_reply', 'information_provided',
      'ref_textbooks', 'ref_journals', 'ref_micromedex', 'ref_clinirex', 'ref_idis', 'ref_website', 'ref_others', 'status'
    ]);

    const cleanPayload = {};
    Object.keys(payload || {}).forEach(k => {
      if (VALID_DIR_COLS.has(k)) cleanPayload[k] = payload[k];
    });

    const { data: existing } = await supabase
      .from('drug_information_requests')
      .select('id')
      .eq('clinical_case_id', cleanPayload.clinical_case_id)
      .maybeSingle();

    let savedData = null;

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('drug_information_requests')
        .update(cleanPayload)
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    } else {
      const { data, error } = await supabase
        .from('drug_information_requests')
        .insert([cleanPayload])
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    }

    return { success: true, request: savedData };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// PHARMACIST INTERVENTION SERVICES
// ====================================================================

export const fetchPharmacistInterventionByCaseIdFromSupabase = async (clinicalCaseId) => {
  try {
    const { data: intervention, error } = await supabase
      .from('pharmacist_interventions')
      .select('*')
      .eq('clinical_case_id', clinicalCaseId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, intervention: intervention || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveOrUpdatePharmacistInterventionInSupabase = async (payload) => {
  try {
    const VALID_INTERVENTION_COLS = new Set([
      'id', 'created_at', 'updated_at', 'clinical_case_id', 'student_id', 'college_id',
      'patient_name', 'age', 'sex', 'date_of_intervention', 'ip_op_no', 'ward',
      'present_diagnosis', 'prescription_details', 'prescription_problems',
      'prescription_problem_other', 'description_of_problem', 'action_taken',
      'action_taken_other', 'recommendations', 'recommendation_other',
      'background_info_collected', 'discussed_with_physician', 'suggestions_appropriate_time',
      'accepted', 'changed', 'reasons_if_no', 'significance_of_intervention', 'outcome',
      'references_text', 'follow_up', 'status'
    ]);

    const cleanPayload = {};
    Object.keys(payload || {}).forEach(k => {
      if (VALID_INTERVENTION_COLS.has(k)) cleanPayload[k] = payload[k];
    });

    const { data: existing } = await supabase
      .from('pharmacist_interventions')
      .select('id')
      .eq('clinical_case_id', cleanPayload.clinical_case_id)
      .maybeSingle();

    let savedData = null;

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('pharmacist_interventions')
        .update(cleanPayload)
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    } else {
      const { data, error } = await supabase
        .from('pharmacist_interventions')
        .insert([cleanPayload])
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    }

    return { success: true, intervention: savedData };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// PATIENT COUNSELLING SERVICES
// ====================================================================

export const fetchPatientCounsellingByCaseIdFromSupabase = async (clinicalCaseId) => {
  try {
    const { data: counselling, error } = await supabase
      .from('patient_counselling')
      .select('*')
      .eq('clinical_case_id', clinicalCaseId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, counselling: counselling || null };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveOrUpdatePatientCounsellingInSupabase = async (payload) => {
  try {
    const VALID_COUNSELLING_COLS = new Set([
      'id', 'created_at', 'updated_at', 'clinical_case_id', 'student_id', 'college_id',
      'counselling_date', 'counselling_time', 'patient_type', 'ip_op_number', 'unit_ward',
      'age', 'sex', 'allergies', 'specific_background_collected', 'disease_counselled',
      'medications_counselled', 'points_covered', 'major_barriers_involved', 'barrier_details',
      'barrier_overcome', 'time_taken', 'counselling_provided_to', 'representative_reasons',
      'representative_other_reason', 'counselling_aids_used', 'counselling_material_provided',
      'understanding_ascertained', 'status'
    ]);

    const cleanPayload = {};
    Object.keys(payload || {}).forEach(k => {
      if (VALID_COUNSELLING_COLS.has(k)) cleanPayload[k] = payload[k];
    });

    const { data: existing } = await supabase
      .from('patient_counselling')
      .select('id')
      .eq('clinical_case_id', cleanPayload.clinical_case_id)
      .maybeSingle();

    let savedData = null;

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('patient_counselling')
        .update(cleanPayload)
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    } else {
      const { data, error } = await supabase
        .from('patient_counselling')
        .insert([cleanPayload])
        .select();

      if (error) return { success: false, error: error.message };
      savedData = data[0];
    }

    return { success: true, counselling: savedData };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// PATIENT PROFILE & CHILD TABLES SERVICES
// ====================================================================

export const fetchPatientProfileByCaseIdFromSupabase = async (clinicalCaseId) => {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('clinical_case_id', clinicalCaseId)
      .maybeSingle();

    if (profileErr) return { success: false, error: profileErr.message };
    if (!profile) return { success: true, profile: null, labInvestigations: [], prescribedDrugs: [] };

    const [labRes, drugRes] = await Promise.all([
      supabase.from('patient_lab_investigations').select('*').eq('patient_profile_id', profile.id).order('created_at', { ascending: true }),
      supabase.from('patient_prescribed_drugs').select('*').eq('patient_profile_id', profile.id).order('s_no', { ascending: true })
    ]);

    return {
      success: true,
      profile,
      labInvestigations: labRes.data || [],
      prescribedDrugs: drugRes.data || []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveOrUpdatePatientProfileInSupabase = async (payload) => {
  try {
    const VALID_COLS = new Set([
      'id', 'created_at', 'updated_at', 'clinical_case_id', 'student_id', 'college_id',
      'patient_name', 'age', 'gender', 'ip_no', 'height', 'weight', 'bmi', 'ward',
      'department', 'doa', 'doc', 'dod', 'physician', 'chief_complaints',
      'past_medical_history', 'past_medication_history', 'family_history',
      'smoker_pack_day', 'smoker_duration', 'alcoholic_amount_day', 'alcoholic_duration',
      'allergy_food', 'allergy_drugs', 'marital_status', 'cyanosis', 'icterus', 'pallor',
      'cvs', 'gi', 'rs', 'cns', 'provisional_diagnosis', 'vital_signs',
      'other_investigations', 'final_diagnosis', 'discharge_summary', 'status'
    ]);

    const cleanPayload = {};
    Object.keys(payload || {}).forEach(key => {
      if (VALID_COLS.has(key)) {
        cleanPayload[key] = payload[key];
      }
    });

    const { data: existing } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('clinical_case_id', cleanPayload.clinical_case_id)
      .maybeSingle();

    let savedProfile = null;

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('patient_profiles')
        .update(cleanPayload)
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      savedProfile = data[0];
    } else {
      const { data, error } = await supabase
        .from('patient_profiles')
        .insert([cleanPayload])
        .select();

      if (error) return { success: false, error: error.message };
      savedProfile = data[0];
    }

    return { success: true, profile: savedProfile };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const saveLabInvestigationsInSupabase = async (patientProfileId, labRecords) => {
  try {
    await supabase.from('patient_lab_investigations').delete().eq('patient_profile_id', patientProfileId);
    if (!labRecords || labRecords.length === 0) return { success: true, data: [] };

    const payloads = labRecords.map(r => ({
      patient_profile_id: patientProfileId,
      category: r.category || 'General',
      parameter_name: r.parameter_name,
      reference_range: r.reference_range || null,
      test_date: r.test_date || new Date().toISOString().split('T')[0],
      test_value: r.test_value || null,
      unit: r.unit || null
    }));

    const { data, error } = await supabase.from('patient_lab_investigations').insert(payloads).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const savePrescribedDrugsInSupabase = async (patientProfileId, drugRecords) => {
  try {
    await supabase.from('patient_prescribed_drugs').delete().eq('patient_profile_id', patientProfileId);
    if (!drugRecords || drugRecords.length === 0) return { success: true, data: [] };

    const payloads = drugRecords.map((d, index) => ({
      patient_profile_id: patientProfileId,
      s_no: d.s_no || index + 1,
      trade_name: d.trade_name,
      generic_name: d.generic_name,
      route_of_admin: d.route_of_admin || 'Oral',
      dose: d.dose,
      frequency: d.frequency || 'OD',
      start_date: d.start_date || null,
      stop_date: d.stop_date || null
    }));

    const { data, error } = await supabase.from('patient_prescribed_drugs').insert(payloads).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// CLINICAL CASES SERVICES
// ====================================================================

export const generateUniqueCaseIdInSupabase = async (collegeCode = 'AMRMCP') => {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `${collegeCode.toUpperCase()}-${currentYear}-`;

    const { data, error } = await supabase
      .from('clinical_cases')
      .select('case_id')
      .like('case_id', `${prefix}%`)
      .order('case_id', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (data && data.length > 0 && data[0].case_id) {
      const lastId = data[0].case_id;
      const parts = lastId.split('-');
      if (parts.length === 3) {
        const parsedNum = parseInt(parts[2], 10);
        if (!isNaN(parsedNum)) nextNumber = parsedNum + 1;
      }
    }

    const formattedSequence = String(nextNumber).padStart(6, '0');
    return { success: true, caseId: `${prefix}${formattedSequence}` };
  } catch (err) {
    return { success: false, caseId: `${collegeCode.toUpperCase()}-2026-000001` };
  }
};

export const insertClinicalCaseToSupabase = async (casePayload) => {
  try {
    const { data, error } = await supabase
      .from('clinical_cases')
      .insert([{
        case_id: casePayload.caseId,
        college_id: casePayload.collegeId,
        student_id: casePayload.studentId,
        preceptor_id: casePayload.preceptorId || null,
        hospital_name: casePayload.hospitalName,
        department: casePayload.department,
        ward_unit: casePayload.wardUnit,
        ip_op_type: casePayload.ipOpType,
        date_of_admission: casePayload.dateOfAdmission,
        date_of_collection: casePayload.dateOfCollection,
        academic_year: casePayload.academicYear || '2026–2027',
        status: casePayload.status || 'Draft'
      }])
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchStudentCasesFromSupabase = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('clinical_cases')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const fetchStudentCasesForPreceptorFromSupabase = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('clinical_cases')
      .select('*')
      .eq('student_id', studentId)
      .neq('status', 'Draft')
      .order('created_at', { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    const filtered = (data || []).filter(c => c.status !== 'Draft' && c.overall_case_status !== 'Draft');
    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const updateClinicalCaseInSupabase = async (caseRecordId, casePayload) => {
  try {
    const { data, error } = await supabase
      .from('clinical_cases')
      .update({
        hospital_name: casePayload.hospitalName,
        department: casePayload.department,
        ward_unit: casePayload.wardUnit,
        ip_op_type: casePayload.ipOpType,
        date_of_admission: casePayload.dateOfAdmission,
        date_of_collection: casePayload.dateOfCollection,
        status: casePayload.status || 'Draft'
      })
      .eq('id', caseRecordId)
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deleteClinicalCaseFromSupabase = async (caseRecordId) => {
  try {
    const { error } = await supabase.from('clinical_cases').delete().eq('id', caseRecordId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// PRECEPTOR PORTAL SERVICES
// ====================================================================

export const authenticatePreceptorInSupabase = async (username, password) => {
  try {
    const inputHash = await hashPassword(password);
    if (!inputHash) return { success: false, error: 'Invalid password format' };

    const { data: preceptor, error } = await supabase
      .from('preceptors')
      .select('*, colleges(*)')
      .eq('username', username)
      .maybeSingle();

    if (error || !preceptor) return { success: false, error: 'Invalid Username or Password' };
    if (preceptor.status !== 'Active') return { success: false, error: 'Your Preceptor account is currently Inactive. Contact College Admin.' };
    if (preceptor.password_hash !== inputHash) return { success: false, error: 'Invalid Username or Password' };

    return { success: true, preceptor };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchPreceptorAssignedStudentsFromSupabase = async (preceptorId) => {
  try {
    const { data, error } = await supabase
      .from('student_preceptor_assignments')
      .select(`*, students(*)`)
      .eq('preceptor_id', preceptorId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

// ====================================================================
// STUDENT PORTAL SERVICES
// ====================================================================

export const authenticateStudentInSupabase = async (username, password) => {
  try {
    const inputHash = await hashPassword(password);
    if (!inputHash) return { success: false, error: 'Invalid password format' };

    const { data: student, error } = await supabase
      .from('students')
      .select('*, colleges(*)')
      .eq('username', username)
      .maybeSingle();

    if (error || !student) return { success: false, error: 'Invalid Username or Password' };
    if (student.status !== 'Active') return { success: false, error: 'Your Student account is currently Inactive. Contact College Admin.' };
    if (student.password_hash !== inputHash) return { success: false, error: 'Invalid Username or Password' };

    return { success: true, student };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchStudentAssignedPreceptorFromSupabase = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('student_preceptor_assignments')
      .select(`*, preceptors(*)`)
      .eq('student_id', studentId)
      .eq('status', 'Active')
      .maybeSingle();

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data: data ? data.preceptors : null, assignment: data };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
};

// ====================================================================
// STUDENT-PRECEPTOR ASSIGNMENTS CORE SERVICES
// ====================================================================

export const fetchAssignmentsFromSupabase = async (collegeId, preceptorId = null) => {
  try {
    let query = supabase
      .from('student_preceptor_assignments')
      .select(`*, students(*), preceptors(*)`)
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false });

    if (preceptorId) query = query.eq('preceptor_id', preceptorId);

    const { data, error } = await query;
    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const assignStudentsToPreceptorInSupabase = async ({ collegeId, preceptorId, studentIds, assignmentDate, remarks, status = 'Active' }) => {
  try {
    if (status === 'Active') {
      const { data: existingActive } = await supabase
        .from('student_preceptor_assignments')
        .select('student_id, students(roll_number, full_name)')
        .eq('college_id', collegeId)
        .eq('status', 'Active')
        .in('student_id', studentIds);

      if (existingActive && existingActive.length > 0) {
        const conflictNames = existingActive.map(a => a.students ? `${a.students.full_name} (${a.students.roll_number})` : a.student_id).join(', ');
        return { 
          success: false, 
          error: `The following student(s) already have an active preceptor assignment: ${conflictNames}. Please remove or deactivate their existing assignment before reassigning.` 
        };
      }
    }

    const dateToSave = assignmentDate || new Date().toISOString().split('T')[0];
    const payloads = studentIds.map(sId => ({
      college_id: collegeId,
      preceptor_id: preceptorId,
      student_id: sId,
      assignment_date: dateToSave,
      remarks: remarks || null,
      status: status
    }));

    const { data, error } = await supabase.from('student_preceptor_assignments').insert(payloads).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updateAssignmentInSupabase = async (assignmentId, payload) => {
  try {
    const { data, error } = await supabase
      .from('student_preceptor_assignments')
      .update({ assignment_date: payload.assignmentDate, remarks: payload.remarks || null, status: payload.status || 'Active' })
      .eq('id', assignmentId)
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const removeAssignmentFromSupabase = async (assignmentId) => {
  try {
    const { error } = await supabase.from('student_preceptor_assignments').delete().eq('id', assignmentId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// PRECEPTOR CRUD SERVICES
// ====================================================================

export const fetchPreceptorsFromSupabase = async (collegeId) => {
  try {
    let query = supabase.from('preceptors').select('*').order('created_at', { ascending: false });
    if (collegeId) query = query.eq('college_id', collegeId);

    const { data, error } = await query;
    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const insertPreceptorToSupabase = async (collegeId, preceptorData) => {
  try {
    const passwordHash = await hashPassword(preceptorData.password);
    if (!passwordHash) return { success: false, error: 'Password hashing failed' };

    const payload = {
      college_id: collegeId,
      full_name: preceptorData.fullName,
      gender: preceptorData.gender,
      mobile_number: preceptorData.mobileNumber,
      email: preceptorData.email,
      qualification: preceptorData.qualification,
      designation: preceptorData.designation,
      department: preceptorData.department,
      username: preceptorData.email,
      password_hash: passwordHash,
      profile_photo_url: preceptorData.profilePhotoUrl || null,
      status: preceptorData.status || 'Active'
    };

    const { data, error } = await supabase.from('preceptors').insert([payload]).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updatePreceptorInSupabase = async (preceptorId, preceptorData) => {
  try {
    const payload = {
      full_name: preceptorData.fullName,
      gender: preceptorData.gender,
      mobile_number: preceptorData.mobileNumber,
      email: preceptorData.email,
      qualification: preceptorData.qualification,
      designation: preceptorData.designation,
      department: preceptorData.department,
      username: preceptorData.email,
      profile_photo_url: preceptorData.profilePhotoUrl || null,
      status: preceptorData.status || 'Active'
    };

    if (preceptorData.password) {
      const passwordHash = await hashPassword(preceptorData.password);
      if (passwordHash) payload.password_hash = passwordHash;
    }

    const { data, error } = await supabase.from('preceptors').update(payload).eq('id', preceptorId).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deletePreceptorFromSupabase = async (preceptorId) => {
  try {
    const { error } = await supabase.from('preceptors').delete().eq('id', preceptorId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// STUDENT CRUD SERVICES
// ====================================================================

export const fetchStudentsFromSupabase = async (collegeId) => {
  try {
    let query = supabase.from('students').select('*').order('created_at', { ascending: false });
    if (collegeId) query = query.eq('college_id', collegeId);

    const { data, error } = await query;
    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const insertStudentToSupabase = async (collegeId, studentData) => {
  try {
    const passwordHash = await hashPassword(studentData.password);
    if (!passwordHash) return { success: false, error: 'Password hashing failed' };

    const payload = {
      college_id: collegeId,
      roll_number: studentData.rollNumber,
      full_name: studentData.fullName,
      gender: studentData.gender,
      mobile_number: studentData.mobileNumber || null,
      email: studentData.email,
      batch: studentData.batch,
      course: studentData.course || 'Pharm.D',
      academic_year: studentData.academicYear || '2026–2027',
      year: studentData.year,
      username: studentData.rollNumber,
      password_hash: passwordHash,
      profile_photo_url: studentData.profilePhotoUrl || null,
      status: studentData.status || 'Active'
    };

    const { data, error } = await supabase.from('students').insert([payload]).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updateStudentInSupabase = async (studentId, studentData) => {
  try {
    const payload = {
      roll_number: studentData.rollNumber,
      full_name: studentData.fullName,
      gender: studentData.gender,
      mobile_number: studentData.mobileNumber || null,
      email: studentData.email,
      batch: studentData.batch,
      course: studentData.course || 'Pharm.D',
      academic_year: studentData.academicYear || '2026–2027',
      year: studentData.year,
      username: studentData.rollNumber,
      profile_photo_url: studentData.profilePhotoUrl || null,
      status: studentData.status || 'Active'
    };

    if (studentData.password) {
      const passwordHash = await hashPassword(studentData.password);
      if (passwordHash) payload.password_hash = passwordHash;
    }

    const { data, error } = await supabase.from('students').update(payload).eq('id', studentId).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deleteStudentFromSupabase = async (studentId) => {
  try {
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// REGISTRATION REQUEST & COLLEGE CORE SERVICES
// ====================================================================

export const submitCollegeRegistrationToSupabase = async (formData) => {
  const payload = {
    college_name: formData.collegeName,
    city: formData.city,
    state: formData.state,
    contact_person: formData.contactName,
    mobile_number: formData.mobileNumber,
    email: formData.email,
    status: 'Pending'
  };

  try {
    const { data, error } = await supabase.from('registration_requests').insert([payload]).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchRegistrationRequestsFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('registration_requests').select('*').order('created_at', { ascending: false });
    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const approveCollegeInSupabase = async (request) => {
  try {
    await supabase.from('registration_requests').update({ status: 'Approved', approved_at: new Date().toISOString() }).eq('id', request.id);

    const collegeCode = request.code || `${(request.collegeName || request.college_name).substring(0, 4).toUpperCase()}-${request.city.substring(0, 3).toUpperCase()}`;

    const collegePayload = {
      registration_request_id: request.id,
      college_code: collegeCode,
      college_name: request.collegeName || request.college_name,
      college_logo_url: request.collegeLogoUrl || null,
      college_description: request.collegeDescription || null,
      college_admin_username: request.email,
      address: request.address || null,
      city: request.city,
      district: request.district || null,
      state: request.state,
      pincode: request.pinCode || request.pincode || null,
      university_affiliation: request.universityAffiliation || null,
      pci_approval_number: request.pciApprovalNo || null,
      principal_name: request.contactName || request.contact_person,
      principal_mobile: request.mobileNumber || request.mobile_number,
      principal_email: request.email,
      hospital_name: request.hospitalName || 'Lalitha Superspecialities Hospital',
      is_autonomous: Boolean(request.isAutonomous),
      status: 'Active'
    };

    const { data: collegeData, error: collegeErr } = await supabase.from('colleges').insert([collegePayload]).select();
    if (collegeErr) return { success: false, error: collegeErr.message };

    const createdCollege = collegeData[0];

    const subscriptionPayload = {
      college_id: createdCollege.id,
      plan_name: request.subscriptionPlan || 'Professional',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_expiry_date: '2027-08-04',
      maximum_students: parseInt(request.maxStudentsAllowed, 10) || 600,
      status: 'Active'
    };

    const { data: subData } = await supabase.from('subscriptions').insert([subscriptionPayload]).select();
    if (subData && subData[0]) {
      await supabase.from('colleges').update({ subscription_id: subData[0].id }).eq('id', createdCollege.id);
    }

    return { success: true, data: createdCollege };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const rejectCollegeInSupabase = async (requestId, remarks = '') => {
  try {
    const { data, error } = await supabase.from('registration_requests').update({ status: 'Rejected', rejected_at: new Date().toISOString(), remarks: remarks || null }).eq('id', requestId).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updateCollegeProfileAndSubscriptionInSupabase = async (collegeId, profileData) => {
  try {
    const collegeUpdatePayload = {
      college_code: profileData.collegeCode,
      college_name: profileData.collegeName,
      college_logo: profileData.collegeLogo || profileData.logoBg || null,
      college_logo_url: profileData.collegeLogoUrl || null,
      college_description: profileData.collegeDescription || null,
      college_admin_username: profileData.principalEmail,
      address: profileData.address || null,
      city: profileData.city,
      district: profileData.district || null,
      state: profileData.state,
      pincode: profileData.pinCode || profileData.pincode || null,
      university_affiliation: profileData.universityAffiliation || null,
      pci_approval_number: profileData.pciApprovalNo || profileData.pci_approval_number || null,
      principal_name: profileData.principalName || null,
      principal_mobile: profileData.principalMobile || null,
      principal_email: profileData.principalEmail || null,
      hospital_name: profileData.hospitalName || null,
      hospital_logo_url: profileData.hospitalLogoUrl || null,
      is_autonomous: Boolean(profileData.isAutonomous),
      status: profileData.subscriptionStatus === 'Active' ? 'Active' : 'Inactive',
      updated_at: new Date().toISOString()
    };

    if (profileData.adminPassword) {
      const passwordHash = await hashPassword(profileData.adminPassword);
      if (passwordHash) collegeUpdatePayload.college_admin_password_hash = passwordHash;
    }

    const { data: updatedCollege, error: updateCollegeErr } = await supabase
      .from('colleges')
      .update(collegeUpdatePayload)
      .eq('id', collegeId)
      .select();

    if (updateCollegeErr) return { success: false, error: updateCollegeErr.message };

    // Fetch fresh college record directly from Supabase
    const { data: freshCollege } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', collegeId)
      .maybeSingle();

    return { success: true, college: freshCollege || (updatedCollege ? updatedCollege[0] : null) };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const authenticateCollegeAdminInSupabase = async (username, password) => {
  try {
    const inputHash = await hashPassword(password);
    if (!inputHash) return { success: false, error: 'Invalid password format' };

    const { data: college, error } = await supabase.from('colleges').select('*').eq('college_admin_username', username).maybeSingle();
    if (error || !college) return { success: false, error: 'Invalid User ID or Password' };
    if (!college.college_admin_password_hash) return { success: false, error: 'College Admin password has not been set by Super Admin.' };
    if (college.college_admin_password_hash !== inputHash) return { success: false, error: 'Invalid User ID or Password' };

    return { success: true, college };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchActiveCollegesFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('colleges').select(`*, subscriptions!fk_colleges_subscription(*)`).eq('status', 'Active').order('created_at', { ascending: false });
    if (error) {
      const { data: simpleData } = await supabase.from('colleges').select('*').eq('status', 'Active').order('created_at', { ascending: false });
      return { success: true, data: simpleData || [] };
    }
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const deleteCollegeFromSupabase = async (targetId) => {
  try {
    let requestId = targetId;
    let collegeId = targetId;

    const { data: colMatch } = await supabase.from('colleges').select('id, registration_request_id').eq('id', targetId).maybeSingle();
    if (colMatch) {
      collegeId = colMatch.id;
      if (colMatch.registration_request_id) requestId = colMatch.registration_request_id;
    }

    await supabase.from('registration_requests').delete().eq('id', requestId);
    await supabase.from('subscriptions').delete().eq('college_id', collegeId);
    await supabase.from('colleges').delete().eq('id', collegeId);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deleteMultipleCollegesFromSupabase = async (targetIds) => {
  try {
    const { data: colMatches } = await supabase.from('colleges').select('id, registration_request_id').in('id', targetIds);
    let allRequestIds = [...targetIds];
    let allCollegeIds = [...targetIds];

    if (colMatches && colMatches.length > 0) {
      colMatches.forEach(c => {
        if (c.id) allCollegeIds.push(c.id);
        if (c.registration_request_id) allRequestIds.push(c.registration_request_id);
      });
    }

    await supabase.from('registration_requests').delete().in('id', allRequestIds);
    await supabase.from('subscriptions').delete().in('college_id', allCollegeIds);
    await supabase.from('colleges').delete().in('id', allCollegeIds);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ====================================================================
// CLINICAL CASE LEVEL MODULE STATUS & SUBMISSION SERVICES
// ====================================================================

export const fetchCaseModuleStatusesMapFromSupabase = async (caseIds = []) => {
  if (!caseIds || caseIds.length === 0) return { success: true, statusesMap: {} };

  try {
    const [profilesRes, counsellingRes, interventionRes, dirRes, adrRes] = await Promise.all([
      supabase.from('patient_profiles').select('id, clinical_case_id, status, approval_status').in('clinical_case_id', caseIds),
      supabase.from('patient_counselling').select('id, clinical_case_id, status, approval_status').in('clinical_case_id', caseIds),
      supabase.from('pharmacist_interventions').select('id, clinical_case_id, status, approval_status').in('clinical_case_id', caseIds),
      supabase.from('drug_information_requests').select('id, clinical_case_id, status').in('clinical_case_id', caseIds),
      supabase.from('adr_reports').select('id, clinical_case_id, approval_status').in('clinical_case_id', caseIds)
    ]);

    const profiles = profilesRes.data || [];
    const counselling = counsellingRes.data || [];
    const interventions = interventionRes.data || [];
    const dirs = dirRes.data || [];
    const adrs = adrRes.data || [];

    const statusesMap = {};

    caseIds.forEach(id => {
      const p = profiles.find(item => item.clinical_case_id === id);
      const c = counselling.find(item => item.clinical_case_id === id);
      const i = interventions.find(item => item.clinical_case_id === id);
      const d = dirs.find(item => item.clinical_case_id === id);
      const a = adrs.find(item => item.clinical_case_id === id);

      statusesMap[id] = {
        profileStatus: p ? (p.approval_status || p.status || 'Completed') : 'Not Started',
        counsellingStatus: c ? (c.approval_status || c.status || 'Completed') : 'Not Started',
        interventionStatus: i ? (i.approval_status || i.status || 'Completed') : 'Not Added',
        dirStatus: d ? (d.status || 'Completed') : 'Not Added',
        adrStatus: a ? (a.approval_status || 'Completed') : 'Not Added',
        hasProfile: Boolean(p),
        hasCounselling: Boolean(c),
        hasIntervention: Boolean(i),
        hasDir: Boolean(d),
        hasAdr: Boolean(a)
      };
    });

    return { success: true, statusesMap };
  } catch (err) {
    return { success: false, error: err.message, statusesMap: {} };
  }
};

export const fetchCaseModuleStatusesFromSupabase = async (clinicalCaseId) => {
  if (!clinicalCaseId) return { success: false, records: {} };

  try {
    const [profileRes, counsellingRes, interventionRes, dirRes, adrRes] = await Promise.all([
      supabase.from('patient_profiles').select('*').eq('clinical_case_id', clinicalCaseId).maybeSingle(),
      supabase.from('patient_counselling').select('*').eq('clinical_case_id', clinicalCaseId).maybeSingle(),
      supabase.from('pharmacist_interventions').select('*').eq('clinical_case_id', clinicalCaseId).maybeSingle(),
      supabase.from('drug_information_requests').select('*').eq('clinical_case_id', clinicalCaseId).maybeSingle(),
      supabase.from('adr_reports').select('*').eq('clinical_case_id', clinicalCaseId).maybeSingle()
    ]);

    return {
      success: true,
      records: {
        profile: profileRes.data || {},
        counselling: counsellingRes.data || {},
        intervention: interventionRes.data || {},
        dir: dirRes.data || {},
        adr: adrRes.data || {}
      }
    };
  } catch (err) {
    return { success: false, error: err.message, records: {} };
  }
};


export const submitCompleteClinicalCaseInSupabase = async (clinicalCase, caseModuleStatus) => {
  try {
    if (!caseModuleStatus || !caseModuleStatus.hasProfile || !caseModuleStatus.hasCounselling) {
      return {
        success: false,
        error: '❌ Complete Patient Profile and Patient Counselling before submitting this Clinical Case.'
      };
    }

    const caseId = clinicalCase.id;

    // 1. Update clinical_cases status to 'Submitted'
    const { error: caseErr } = await supabase
      .from('clinical_cases')
      .update({ status: 'Submitted', updated_at: new Date().toISOString() })
      .eq('id', caseId);

    if (caseErr) return { success: false, error: caseErr.message };

    // 2. Cascade status update to child tables if present
    await Promise.all([
      supabase.from('patient_profiles').update({ status: 'Submitted', approval_status: 'Submitted' }).eq('clinical_case_id', caseId),
      supabase.from('patient_counselling').update({ status: 'Submitted', approval_status: 'Submitted' }).eq('clinical_case_id', caseId),
      supabase.from('pharmacist_interventions').update({ status: 'Submitted', approval_status: 'Submitted' }).eq('clinical_case_id', caseId),
      supabase.from('drug_information_requests').update({ status: 'Submitted' }).eq('clinical_case_id', caseId),
      supabase.from('adr_reports').update({ approval_status: 'Submitted' }).eq('clinical_case_id', caseId)
    ]);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const approveClinicalCaseByPreceptorFromSupabase = async (clinicalCase, preceptorId, comments = '') => {
  try {
    const caseId = clinicalCase.id;
    const now = new Date().toISOString();

    const updatePayload = {
      status: 'Approved',
      overall_case_status: 'Approved',
      reviewed_by: preceptorId,
      reviewed_at: now,
      overall_preceptor_comments: comments,
      case_locked: true,
      returned_forms: [],
      updated_at: now
    };

    // Try full update on clinical_cases
    const { error: caseErr } = await supabase.from('clinical_cases').update(updatePayload).eq('id', caseId);
    if (caseErr) {
      // Fallback to basic status update if extra columns are absent
      await supabase.from('clinical_cases').update({ status: 'Approved', updated_at: now }).eq('id', caseId);
    }

    // Cascade approval to child tables
    await Promise.all([
      supabase.from('patient_profiles').update({ status: 'Approved', approval_status: 'Approved', review_status: 'Approved', preceptor_comments: comments, reviewed_at: now }).eq('clinical_case_id', caseId),
      supabase.from('patient_counselling').update({ status: 'Approved', approval_status: 'Approved', review_status: 'Approved', preceptor_comments: comments, reviewed_at: now }).eq('clinical_case_id', caseId),
      supabase.from('pharmacist_interventions').update({ status: 'Approved', approval_status: 'Approved', review_status: 'Approved', preceptor_comments: comments, reviewed_at: now }).eq('clinical_case_id', caseId),
      supabase.from('drug_information_requests').update({ status: 'Approved', review_status: 'Approved', reviewed_at: now }).eq('clinical_case_id', caseId),
      supabase.from('adr_reports').update({ approval_status: 'Approved', review_status: 'Approved', reviewed_at: now }).eq('clinical_case_id', caseId)
    ]);

    // Insert into review history table if available
    try {
      await supabase.from('clinical_case_review_history').insert({
        clinical_case_id: caseId,
        student_id: clinicalCase.student_id,
        preceptor_id: preceptorId,
        action: 'Approved',
        returned_forms: [],
        comments: comments || 'Case approved by preceptor.',
        created_at: now
      });
    } catch (e) {
      // Table creation optional fallback
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const returnClinicalCaseByPreceptorFromSupabase = async (clinicalCase, preceptorId, returnedForms = [], comments = '') => {
  try {
    if (!comments || !comments.trim()) {
      return { success: false, error: 'Faculty comments are mandatory when returning a Clinical Case for corrections.' };
    }
    if (!returnedForms || returnedForms.length === 0) {
      return { success: false, error: 'Please select at least one form to return for corrections.' };
    }

    const caseId = clinicalCase.id;
    const now = new Date().toISOString();

    const updatePayload = {
      status: 'Returned',
      overall_case_status: 'Returned',
      reviewed_by: preceptorId,
      reviewed_at: now,
      overall_preceptor_comments: comments.trim(),
      returned_forms: returnedForms,
      case_locked: false,
      updated_at: now
    };

    const { error: caseErr } = await supabase.from('clinical_cases').update(updatePayload).eq('id', caseId);
    if (caseErr) {
      await supabase.from('clinical_cases').update({ status: 'Returned', updated_at: now }).eq('id', caseId);
    }

    // Map module key names
    const isProfileReturned = returnedForms.includes('patient_profile') || returnedForms.includes('Patient Profile');
    const isCounsellingReturned = returnedForms.includes('patient_counselling') || returnedForms.includes('Patient Counselling');
    const isInterventionReturned = returnedForms.includes('pharmacist_intervention') || returnedForms.includes('Pharmacist Intervention');
    const isDirReturned = returnedForms.includes('drug_information_request') || returnedForms.includes('Drug Information Request');
    const isAdrReturned = returnedForms.includes('adr_documentation') || returnedForms.includes('ADR Documentation');

    // Update child modules according to return selection
    await Promise.all([
      supabase.from('patient_profiles').update({
        status: isProfileReturned ? 'Returned' : 'Approved',
        approval_status: isProfileReturned ? 'Returned' : 'Approved',
        review_status: isProfileReturned ? 'Returned' : 'Approved',
        preceptor_comments: isProfileReturned ? comments.trim() : null,
        reviewed_at: now
      }).eq('clinical_case_id', caseId),

      supabase.from('patient_counselling').update({
        status: isCounsellingReturned ? 'Returned' : 'Approved',
        approval_status: isCounsellingReturned ? 'Returned' : 'Approved',
        review_status: isCounsellingReturned ? 'Returned' : 'Approved',
        preceptor_comments: isCounsellingReturned ? comments.trim() : null,
        reviewed_at: now
      }).eq('clinical_case_id', caseId),

      supabase.from('pharmacist_interventions').update({
        status: isInterventionReturned ? 'Returned' : 'Approved',
        approval_status: isInterventionReturned ? 'Returned' : 'Approved',
        review_status: isInterventionReturned ? 'Returned' : 'Approved',
        preceptor_comments: isInterventionReturned ? comments.trim() : null,
        reviewed_at: now
      }).eq('clinical_case_id', caseId),

      supabase.from('drug_information_requests').update({
        status: isDirReturned ? 'Returned' : 'Approved',
        review_status: isDirReturned ? 'Returned' : 'Approved',
        reviewed_at: now
      }).eq('clinical_case_id', caseId),

      supabase.from('adr_reports').update({
        approval_status: isAdrReturned ? 'Returned' : 'Approved',
        review_status: isAdrReturned ? 'Returned' : 'Approved',
        reviewed_at: now
      }).eq('clinical_case_id', caseId)
    ]);

    // Insert into review history table if available
    try {
      await supabase.from('clinical_case_review_history').insert({
        clinical_case_id: caseId,
        student_id: clinicalCase.student_id,
        preceptor_id: preceptorId,
        action: 'Returned',
        returned_forms: returnedForms,
        comments: comments.trim(),
        created_at: now
      });
    } catch (e) {
      // Table creation optional fallback
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchCollegeClinicalCasesFromSupabase = async (collegeId) => {
  try {
    const { data, error } = await supabase
      .from('clinical_cases')
      .select(`
        *,
        students!fk_clinical_cases_student(*),
        preceptors!fk_clinical_cases_preceptor(*)
      `)
      .eq('college_id', collegeId)
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });

    if (error) {
      const { data: simpleData } = await supabase
        .from('clinical_cases')
        .select('*')
        .eq('college_id', collegeId)
        .eq('status', 'Approved')
        .order('created_at', { ascending: false });

      const filteredSimple = (simpleData || []).filter(c => c.status === 'Approved' || c.overall_case_status === 'Approved');
      return { success: true, data: filteredSimple };
    }

    const filtered = (data || []).filter(c => c.status === 'Approved' || c.overall_case_status === 'Approved');
    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};



