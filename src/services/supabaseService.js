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

  // Validate 100 KB max size
  if (file.size > 100 * 1024) {
    return { success: false, error: 'File size exceeds 100 KB limit. Please choose a smaller image.' };
  }

  // Validate JPG / JPEG / PNG
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { success: false, error: 'Invalid file format. Only JPG, JPEG, and PNG images are allowed.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('[Supabase Storage] Uploading profile photo:', filePath);

    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('⚠️ [Supabase Storage Warning] Storage bucket notice:', error.message);
      // Fallback: Convert file to Base64 Data URL if storage bucket is not pre-configured
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ success: true, url: reader.result });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    console.log('✅ [Supabase Storage Success] Public Photo URL:', publicUrlData.publicUrl);
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
 * Upload college logo file to Supabase Storage bucket 'college-logos'
 */
export const uploadCollegeLogoToSupabaseStorage = async (file) => {
  if (!file) return { success: false, error: 'No file provided' };

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
// PRECEPTOR CRUD SERVICES
// ====================================================================

export const fetchPreceptorsFromSupabase = async (collegeId) => {
  console.log('[Supabase Operation] Fetching preceptors for College ID:', collegeId);

  try {
    let query = supabase.from('preceptors').select('*').order('created_at', { ascending: false });
    if (collegeId) query = query.eq('college_id', collegeId);

    const { data, error } = await query;
    if (error) {
      console.error('❌ [Supabase Error] Failed to fetch preceptors:', error);
      return { success: false, data: [], error: error.message };
    }

    console.log('✅ [Supabase Success] Fetched preceptors:', data);
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during fetch preceptors:', err);
    return { success: false, data: [], error: err.message };
  }
};

export const insertPreceptorToSupabase = async (collegeId, preceptorData) => {
  console.log('[Supabase Operation] Inserting Preceptor for College ID:', collegeId);

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
      username: preceptorData.email, // Auto-populated from email
      password_hash: passwordHash,
      profile_photo_url: preceptorData.profilePhotoUrl || null,
      status: preceptorData.status || 'Active'
    };

    console.log('➜ Payload:', payload);

    const { data, error } = await supabase
      .from('preceptors')
      .insert([payload])
      .select();

    if (error) {
      console.error('❌ [Supabase Error] Failed to insert preceptor:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Inserted preceptor:', data[0]);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error inserting preceptor:', err);
    return { success: false, error: err.message };
  }
};

export const updatePreceptorInSupabase = async (preceptorId, preceptorData) => {
  console.log('[Supabase Operation] Updating Preceptor ID:', preceptorId);

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

    const { data, error } = await supabase
      .from('preceptors')
      .update(payload)
      .eq('id', preceptorId)
      .select();

    if (error) {
      console.error('❌ [Supabase Error] Failed to update preceptor:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Updated preceptor:', data[0]);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error updating preceptor:', err);
    return { success: false, error: err.message };
  }
};

export const deletePreceptorFromSupabase = async (preceptorId) => {
  console.log('[Supabase Operation] Deleting Preceptor ID:', preceptorId);

  try {
    const { error } = await supabase
      .from('preceptors')
      .delete()
      .eq('id', preceptorId);

    if (error) {
      console.error('❌ [Supabase Error] Delete preceptor failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Deleted Preceptor ID:', preceptorId);
    return { success: true };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error deleting preceptor:', err);
    return { success: false, error: err.message };
  }
};

// ====================================================================
// STUDENT CRUD SERVICES
// ====================================================================

export const fetchStudentsFromSupabase = async (collegeId) => {
  console.log('[Supabase Operation] Fetching students for College ID:', collegeId);

  try {
    let query = supabase.from('students').select('*').order('created_at', { ascending: false });
    if (collegeId) query = query.eq('college_id', collegeId);

    const { data, error } = await query;
    if (error) {
      console.error('❌ [Supabase Error] Failed to fetch students:', error);
      return { success: false, data: [], error: error.message };
    }

    console.log('✅ [Supabase Success] Fetched students:', data);
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error during fetch students:', err);
    return { success: false, data: [], error: err.message };
  }
};

export const insertStudentToSupabase = async (collegeId, studentData) => {
  console.log('[Supabase Operation] Inserting Student for College ID:', collegeId);

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
      username: studentData.rollNumber, // Auto-populated from Roll Number
      password_hash: passwordHash,
      profile_photo_url: studentData.profilePhotoUrl || null,
      status: studentData.status || 'Active'
    };

    console.log('➜ Payload:', payload);

    const { data, error } = await supabase
      .from('students')
      .insert([payload])
      .select();

    if (error) {
      console.error('❌ [Supabase Error] Failed to insert student:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Inserted student:', data[0]);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error inserting student:', err);
    return { success: false, error: err.message };
  }
};

export const updateStudentInSupabase = async (studentId, studentData) => {
  console.log('[Supabase Operation] Updating Student ID:', studentId);

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

    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', studentId)
      .select();

    if (error) {
      console.error('❌ [Supabase Error] Failed to update student:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Updated student:', data[0]);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error updating student:', err);
    return { success: false, error: err.message };
  }
};

export const deleteStudentFromSupabase = async (studentId) => {
  console.log('[Supabase Operation] Deleting Student ID:', studentId);

  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      console.error('❌ [Supabase Error] Delete student failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Supabase Success] Deleted Student ID:', studentId);
    return { success: true };
  } catch (err) {
    console.error('❌ [Supabase Error] Unexpected error deleting student:', err);
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
    const { data, error } = await supabase
      .from('registration_requests')
      .insert([payload])
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchRegistrationRequestsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const approveCollegeInSupabase = async (request) => {
  try {
    await supabase
      .from('registration_requests')
      .update({ status: 'Approved', approved_at: new Date().toISOString() })
      .eq('id', request.id);

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
      status: 'Active'
    };

    const { data: collegeData, error: collegeErr } = await supabase
      .from('colleges')
      .insert([collegePayload])
      .select();

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

    const { data: subData } = await supabase
      .from('subscriptions')
      .insert([subscriptionPayload])
      .select();

    if (subData && subData[0]) {
      await supabase
        .from('colleges')
        .update({ subscription_id: subData[0].id })
        .eq('id', createdCollege.id);
    }

    return { success: true, data: createdCollege };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const rejectCollegeInSupabase = async (requestId, remarks = '') => {
  try {
    const { data, error } = await supabase
      .from('registration_requests')
      .update({ status: 'Rejected', rejected_at: new Date().toISOString(), remarks: remarks || null })
      .eq('id', requestId)
      .select();

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
      status: profileData.subscriptionStatus === 'Active' ? 'Active' : 'Inactive'
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

    const subscriptionPayload = {
      college_id: collegeId,
      plan_name: profileData.subscriptionPlan || 'Professional',
      subscription_start_date: profileData.subscriptionStartDate || new Date().toISOString().split('T')[0],
      subscription_expiry_date: profileData.subscriptionExpiryDate || '2027-08-04',
      maximum_students: parseInt(profileData.maxStudentsAllowed, 10) || 600,
      status: profileData.subscriptionStatus || 'Active'
    };

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('college_id', collegeId)
      .maybeSingle();

    if (existingSub && existingSub.id) {
      await supabase.from('subscriptions').update(subscriptionPayload).eq('id', existingSub.id);
    } else {
      const { data: newSub } = await supabase.from('subscriptions').insert([subscriptionPayload]).select();
      if (newSub && newSub[0]) {
        await supabase.from('colleges').update({ subscription_id: newSub[0].id }).eq('id', collegeId);
      }
    }

    return { success: true, data: updatedCollege ? updatedCollege[0] : null };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const authenticateCollegeAdminInSupabase = async (username, password) => {
  try {
    const inputHash = await hashPassword(password);
    if (!inputHash) return { success: false, error: 'Invalid password format' };

    const { data: college, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('college_admin_username', username)
      .maybeSingle();

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
    const { data, error } = await supabase
      .from('colleges')
      .select(`*, subscriptions!fk_colleges_subscription(*)`)
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

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
