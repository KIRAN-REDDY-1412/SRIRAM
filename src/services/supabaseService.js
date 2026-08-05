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
 * Upload college logo file to Supabase Storage bucket 'college-logos'
 */
export const uploadCollegeLogoToSupabaseStorage = async (file) => {
  if (!file) return { success: false, error: 'No file provided' };

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    console.log('[Supabase Storage] Uploading logo image:', filePath);

    const { data, error } = await supabase.storage
      .from('college-logos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('⚠️ [Supabase Storage Warning] Bucket upload notice:', error.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ success: true, url: reader.result });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('college-logos')
      .getPublicUrl(filePath);

    console.log('✅ [Supabase Storage Success] Public Logo URL:', publicUrlData.publicUrl);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (err) {
    console.error('❌ [Supabase Storage Error] Upload failed:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ success: true, url: reader.result });
      };
      reader.readAsDataURL(file);
    });
  }
};

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

    // 3. Prepare payload for colleges table with college_admin_username from email
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
    console.log('✅ [Supabase Success] Created College in Supabase:', createdCollege);

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
 * Reject registration request with optional remarks/comments
 * Table: registration_requests
 */
export const rejectCollegeInSupabase = async (requestId, remarks = '') => {
  console.log('[Supabase Operation] Rejecting Request ID:', requestId, 'with remarks:', remarks);

  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .update({
        status: 'Rejected',
        rejected_at: new Date().toISOString(),
        remarks: remarks || null
      })
      .eq('id', requestId)
      .select();

    if (error) {
      console.error('❌ [Supabase Error] Failed to reject request:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Rejected Request ID in Supabase:', data);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during rejection:', err);
    return { success: false, error: err.message };
  }
};

/**
 * STEP 5 & STEP 6: Update College Profile & Assign Subscription Plan
 * Tables: colleges, subscriptions
 * Includes college_admin_username & hashed password
 */
export const updateCollegeProfileAndSubscriptionInSupabase = async (collegeId, profileData) => {
  console.log('[Supabase Operation] Updating College Profile & Subscription for ID:', collegeId);

  try {
    // 1. Prepare college update payload
    const collegeUpdatePayload = {
      college_code: profileData.collegeCode,
      college_name: profileData.collegeName,
      college_logo: profileData.collegeLogo || profileData.logoBg || null,
      college_logo_url: profileData.collegeLogoUrl || null,
      college_description: profileData.collegeDescription || null,
      college_admin_username: profileData.principalEmail, // Auto-synced from Principal Email
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
      status: profileData.subscriptionStatus === 'Active' ? 'Active' : 'Inactive'
    };

    // If new password entered, hash it before saving
    if (profileData.adminPassword) {
      const passwordHash = await hashPassword(profileData.adminPassword);
      if (passwordHash) {
        collegeUpdatePayload.college_admin_password_hash = passwordHash;
        console.log('🔐 [Security] Password hashed successfully using SHA-256!');
      }
    }

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
      .maybeSingle();

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
 * College Admin Authentication
 * Authenticate against college_admin_username & college_admin_password_hash
 */
export const authenticateCollegeAdminInSupabase = async (username, password) => {
  console.log('[Supabase Auth] Authenticating College Admin Username:', username);

  try {
    const inputHash = await hashPassword(password);
    if (!inputHash) return { success: false, error: 'Invalid password format' };

    const { data: college, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('college_admin_username', username)
      .maybeSingle();

    if (error || !college) {
      console.warn('⚠️ [Supabase Auth Failed] No college found with username:', username);
      return { success: false, error: 'Invalid User ID or Password' };
    }

    if (!college.college_admin_password_hash) {
      return { success: false, error: 'College Admin password has not been set by Super Admin.' };
    }

    if (college.college_admin_password_hash !== inputHash) {
      console.warn('⚠️ [Supabase Auth Failed] Password mismatch for username:', username);
      return { success: false, error: 'Invalid User ID or Password' };
    }

    console.log('✅ [Supabase Auth Success] College Admin authenticated successfully for:', college.college_name);
    return { success: true, college };
  } catch (err) {
    console.error('❌ [Supabase Auth Error] Unexpected error:', err);
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
 * Delete single college record permanently from ALL Supabase tables
 */
export const deleteCollegeFromSupabase = async (targetId) => {
  console.log('🗑️ [Supabase Operation] Deleting ID from Supabase:', targetId);

  try {
    let requestId = targetId;
    let collegeId = targetId;

    const { data: colMatch } = await supabase
      .from('colleges')
      .select('id, registration_request_id')
      .eq('id', targetId)
      .maybeSingle();

    if (colMatch) {
      collegeId = colMatch.id;
      if (colMatch.registration_request_id) requestId = colMatch.registration_request_id;
    }

    const { error: reqErr } = await supabase
      .from('registration_requests')
      .delete()
      .eq('id', requestId);

    if (reqErr) {
      console.warn('Notice deleting from registration_requests:', reqErr.message);
    }

    await supabase.from('subscriptions').delete().eq('college_id', collegeId);
    await supabase.from('colleges').delete().eq('id', collegeId);

    console.log('✅ [Supabase Success] PERMANENTLY DELETED FROM ALL SUPABASE TABLES:', targetId);
    return { success: true };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during delete:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Bulk Delete multiple colleges permanently from ALL Supabase tables
 */
export const deleteMultipleCollegesFromSupabase = async (targetIds) => {
  console.log('🗑️ [Supabase Operation] Bulk Deleting IDs from Supabase:', targetIds);

  try {
    const { data: colMatches } = await supabase
      .from('colleges')
      .select('id, registration_request_id')
      .in('id', targetIds);

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

    console.log('✅ [Supabase Success] PERMANENTLY BULK DELETED FROM ALL SUPABASE TABLES:', targetIds);
    return { success: true };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during bulk delete:', err);
    return { success: false, error: err.message };
  }
};
