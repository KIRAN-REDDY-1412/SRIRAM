import { supabase } from '../lib/supabaseClient';

/**
 * STEP 2: Submit new college registration request
 * Table: registration_requests
 */
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

  console.log('[Supabase Operation] Submitting College Registration Request:');
  console.log('➜ Payload:', payload);

  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .insert([payload])
      .select();

    if (error) {
      console.error('❌ [Supabase Error] Failed to insert into registration_requests:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Inserted into registration_requests:', data);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during submit:', err);
    return { success: false, error: err.message || 'Database insert failed' };
  }
};

/**
 * STEP 3: Fetch all registration requests for Super Admin
 * Table: registration_requests
 */
export const fetchRegistrationRequestsFromSupabase = async () => {
  console.log('[Supabase Operation] Fetching all registration_requests...');

  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Supabase Error] Failed to fetch registration_requests:', error);
      return { success: false, data: [], error: error.message };
    }

    console.log('✅ [Supabase Success] Fetched registration_requests:', data);
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during fetch requests:', err);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * STEP 4 & STEP 6: Approve registration request, insert into colleges & subscriptions tables
 * Tables: registration_requests, colleges, subscriptions
 */
export const approveCollegeInSupabase = async (request) => {
  console.log('[Supabase Operation] Approving Request ID:', request.id);

  try {
    // 1. Update registration_requests status to 'Approved' & set approved_at timestamp
    const { error: updateErr } = await supabase
      .from('registration_requests')
      .update({ 
        status: 'Approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', request.id);

    if (updateErr) {
      console.error('❌ [Supabase Error] Failed to update request status to Approved:', updateErr);
      return { success: false, error: updateErr.message };
    }

    // 2. Generate unique college_code
    const collegeCode = request.code || `${(request.collegeName || request.college_name).substring(0, 4).toUpperCase()}-${request.city.substring(0, 3).toUpperCase()}`;

    // 3. Prepare payload for colleges table
    const collegePayload = {
      registration_request_id: request.id,
      college_code: collegeCode,
      college_name: request.collegeName || request.college_name,
      city: request.city,
      state: request.state,
      principal_name: request.contactName || request.contact_person,
      principal_mobile: request.mobileNumber || request.mobile_number,
      principal_email: request.email,
      status: 'Active'
    };

    console.log('➜ Inserting into colleges table with Payload:', collegePayload);

    const { data: collegeData, error: collegeErr } = await supabase
      .from('colleges')
      .insert([collegePayload])
      .select();

    if (collegeErr) {
      console.error('❌ [Supabase Error] Failed to insert into colleges:', collegeErr);
      return { success: false, error: collegeErr.message };
    }

    const createdCollege = collegeData[0];
    console.log('✅ [Supabase Success] Created College:', createdCollege);

    // 4. STEP 6: Insert into subscriptions table automatically
    const subscriptionPayload = {
      college_id: createdCollege.id,
      plan_name: request.subscriptionPlan || 'Professional',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_expiry_date: '2027-08-04',
      maximum_students: parseInt(request.maxStudentsAllowed, 10) || 600,
      status: 'Active'
    };

    console.log('➜ Inserting into subscriptions table with Payload:', subscriptionPayload);

    const { data: subData, error: subErr } = await supabase
      .from('subscriptions')
      .insert([subscriptionPayload])
      .select();

    if (subErr) {
      console.error('❌ [Supabase Error] Failed to insert into subscriptions:', subErr);
    } else if (subData && subData[0]) {
      console.log('✅ [Supabase Success] Created Subscription Plan:', subData[0]);

      // Link subscription_id back to colleges
      await supabase
        .from('colleges')
        .update({ subscription_id: subData[0].id })
        .eq('id', createdCollege.id);
    }

    return { success: true, data: createdCollege };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during approval:', err);
    return { success: false, error: err.message };
  }
};

/**
 * STEP 5 & STEP 6: Update College Profile & Assign Subscription Plan
 * Tables: colleges, subscriptions
 */
export const updateCollegeProfileAndSubscriptionInSupabase = async (collegeId, profileData) => {
  console.log('[Supabase Operation] Updating College Profile & Subscription for ID:', collegeId);

  try {
    // 1. Update colleges table
    const collegeUpdatePayload = {
      college_code: profileData.collegeCode,
      college_name: profileData.collegeName,
      college_logo: profileData.collegeLogo || profileData.logoBg,
      address: profileData.address,
      city: profileData.city,
      district: profileData.district,
      state: profileData.state,
      pincode: profileData.pinCode,
      university_affiliation: profileData.universityAffiliation,
      pci_approval_number: profileData.pciApprovalNo,
      principal_name: profileData.principalName,
      principal_mobile: profileData.principalMobile,
      principal_email: profileData.principalEmail,
      status: profileData.subscriptionStatus === 'Active' ? 'Active' : 'Inactive'
    };

    console.log('➜ Updating colleges table with Payload:', collegeUpdatePayload);

    const { data: updatedCollege, error: updateCollegeErr } = await supabase
      .from('colleges')
      .update(collegeUpdatePayload)
      .eq('id', collegeId)
      .select();

    if (updateCollegeErr) {
      console.error('❌ [Supabase Error] Failed to update colleges table:', updateCollegeErr);
      return { success: false, error: updateCollegeErr.message };
    }

    // 2. Insert / Update subscriptions table
    const subscriptionPayload = {
      college_id: collegeId,
      plan_name: profileData.subscriptionPlan || 'Professional',
      subscription_start_date: profileData.subscriptionStartDate || new Date().toISOString().split('T')[0],
      subscription_expiry_date: profileData.subscriptionExpiryDate || '2027-08-04',
      maximum_students: parseInt(profileData.maxStudentsAllowed, 10) || 600,
      status: profileData.subscriptionStatus || 'Active'
    };

    console.log('➜ Inserting/Updating subscriptions table with Payload:', subscriptionPayload);

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('college_id', collegeId)
      .single();

    let subResult;
    if (existingSub && existingSub.id) {
      subResult = await supabase
        .from('subscriptions')
        .update(subscriptionPayload)
        .eq('id', existingSub.id)
        .select();
    } else {
      subResult = await supabase
        .from('subscriptions')
        .insert([subscriptionPayload])
        .select();
    }

    if (subResult.error) {
      console.error('❌ [Supabase Error] Failed to save subscriptions table:', subResult.error);
    } else if (subResult.data && subResult.data[0]) {
      console.log('✅ [Supabase Success] Saved Subscription Plan:', subResult.data[0]);

      await supabase
        .from('colleges')
        .update({ subscription_id: subResult.data[0].id })
        .eq('id', collegeId);
    }

    console.log('✅ [Supabase Success] Profile & Subscription update completed successfully!');
    return { success: true, data: updatedCollege ? updatedCollege[0] : null };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during profile update:', err);
    return { success: false, error: err.message };
  }
};

/**
 * STEP 7: Fetch Active Colleges for Landing Page
 * Table: colleges (where status = 'Active')
 */
export const fetchActiveCollegesFromSupabase = async () => {
  console.log('[Supabase Operation] Fetching Active Colleges for Landing Page...');

  try {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        subscriptions!fk_colleges_subscription(*)
      `)
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [Supabase Error] Failed to fetch active colleges with join:', error);
      const { data: simpleData, error: simpleErr } = await supabase
        .from('colleges')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (simpleErr) return { success: false, data: [], error: simpleErr.message };
      return { success: true, data: simpleData || [] };
    }

    console.log('✅ [Supabase Success] Fetched Active Colleges for Landing Page:', data);
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during fetch active colleges:', err);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Delete single college record from Supabase
 */
export const deleteCollegeFromSupabase = async (collegeId) => {
  console.log('[Supabase Operation] Deleting College ID:', collegeId);

  try {
    await supabase.from('subscriptions').delete().eq('college_id', collegeId);
    const { error: err1 } = await supabase.from('colleges').delete().eq('id', collegeId);
    const { error: err2 } = await supabase.from('registration_requests').delete().eq('id', collegeId);

    if (err1 && err2) {
      console.error('❌ [Supabase Error] Delete college failed:', err1 || err2);
      return { success: false, error: (err1 || err2).message };
    }

    console.log('✅ [Supabase Success] Deleted College ID:', collegeId);
    return { success: true };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during delete:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Delete multiple colleges (Bulk Delete) from Supabase
 */
export const deleteMultipleCollegesFromSupabase = async (collegeIds) => {
  console.log('[Supabase Operation] Bulk Deleting College IDs:', collegeIds);

  try {
    await supabase.from('subscriptions').delete().in('college_id', collegeIds);
    await supabase.from('colleges').delete().in('id', collegeIds);
    await supabase.from('registration_requests').delete().in('id', collegeIds);

    console.log('✅ [Supabase Success] Bulk Deleted College IDs:', collegeIds);
    return { success: true };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during bulk delete:', err);
    return { success: false, error: err.message };
  }
};
