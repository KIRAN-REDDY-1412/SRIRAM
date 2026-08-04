import { supabase } from '../lib/supabaseClient';

/**
 * Fetch active colleges for landing page & admin dashboard
 */
export const fetchActiveCollegesFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('subscription_status', 'Active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Supabase fetch active colleges error:', err.message);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Fetch pending registration requests for Super Admin
 */
export const fetchPendingRequestsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('college_requests')
      .select('*')
      .order('submitted_date', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Supabase fetch requests error:', err.message);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Submit new college registration request
 */
export const submitCollegeRegistrationToSupabase = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('college_requests')
      .insert([
        {
          college_name: formData.collegeName,
          city: formData.city,
          state: formData.state,
          contact_name: formData.contactName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          status: 'Pending'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Supabase submit registration error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Approve registration request & create active college record
 */
export const approveCollegeInSupabase = async (request) => {
  try {
    // 1. Update request status to Approved
    await supabase
      .from('college_requests')
      .update({ status: 'Approved' })
      .eq('id', request.id);

    // 2. Insert into colleges table
    const { data, error } = await supabase
      .from('colleges')
      .insert([
        {
          request_id: request.id,
          name: request.collegeName || request.college_name,
          city: request.city,
          state: request.state,
          code: request.code || `${(request.collegeName || request.college_name).substring(0, 4).toUpperCase()}-${request.city.substring(0, 3).toUpperCase()}`,
          principal_name: request.contactName || request.contact_name,
          principal_mobile: request.mobileNumber || request.mobile_number,
          principal_email: request.email,
          subscription_plan: 'Professional',
          subscription_status: 'Active'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Supabase approve college error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Update college profile & subscription plan
 */
export const updateCollegeProfileInSupabase = async (collegeId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .update({
        name: profileData.collegeName,
        code: profileData.collegeCode,
        city: profileData.city,
        state: profileData.state,
        district: profileData.district,
        pin_code: profileData.pinCode,
        address: profileData.address,
        university_affiliation: profileData.universityAffiliation,
        pci_approval_no: profileData.pciApprovalNo,
        principal_name: profileData.principalName,
        principal_mobile: profileData.principalMobile,
        principal_email: profileData.principalEmail,
        subscription_plan: profileData.subscriptionPlan,
        subscription_start_date: profileData.subscriptionStartDate,
        subscription_expiry_date: profileData.subscriptionExpiryDate,
        max_students_allowed: profileData.maxStudentsAllowed,
        subscription_status: profileData.subscriptionStatus,
        logo_bg: profileData.logoBg
      })
      .eq('id', collegeId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Supabase update college error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Delete single college record
 */
export const deleteCollegeFromSupabase = async (collegeId) => {
  try {
    const { error: err1 } = await supabase.from('colleges').delete().eq('id', collegeId);
    const { error: err2 } = await supabase.from('college_requests').delete().eq('id', collegeId);
    if (err1 && err2) throw err1;
    return { success: true };
  } catch (err) {
    console.error('Supabase delete college error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Delete multiple colleges (Bulk Delete)
 */
export const deleteMultipleCollegesFromSupabase = async (collegeIds) => {
  try {
    await supabase.from('colleges').delete().in('id', collegeIds);
    await supabase.from('college_requests').delete().in('id', collegeIds);
    return { success: true };
  } catch (err) {
    console.error('Supabase bulk delete error:', err.message);
    return { success: false, error: err.message };
  }
};
