import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchActiveCollegesFromSupabase, 
  fetchPendingRequestsFromSupabase, 
  submitCollegeRegistrationToSupabase, 
  approveCollegeInSupabase, 
  updateCollegeProfileInSupabase, 
  deleteCollegeFromSupabase, 
  deleteMultipleCollegesFromSupabase 
} from '../services/supabaseService';

const CollegeContext = createContext();

export const CollegeProvider = ({ children }) => {
  const [activeColleges, setActiveColleges] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inactiveColleges, setInactiveColleges] = useState([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load live data from Supabase on initial mount
  const loadSupabaseData = async () => {
    setIsLoading(true);
    
    // Fetch active colleges
    const collegesRes = await fetchActiveCollegesFromSupabase();
    if (collegesRes.success && Array.isArray(collegesRes.data)) {
      const mappedColleges = collegesRes.data.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        city: c.city,
        state: c.state,
        district: c.district,
        pinCode: c.pin_code,
        address: c.address,
        universityAffiliation: c.university_affiliation,
        pciApprovalNo: c.pci_approval_no,
        principalName: c.principal_name,
        principalMobile: c.principal_mobile,
        principalEmail: c.principal_email,
        logoBg: c.logo_bg || 'from-emerald-600 to-teal-700',
        initials: c.initials || (c.name ? c.name.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase() : 'CLG'),
        studentsCount: c.max_students_allowed || c.students_count || 600,
        portalUrl: c.portal_url || `https://${(c.code || 'clg').toLowerCase()}.pharmdverse.com`,
        status: c.status || 'Active Subscribed',
        subscriptionPlan: c.subscription_plan || 'Professional',
        subscriptionStartDate: c.subscription_start_date || new Date().toISOString().split('T')[0],
        subscriptionExpiryDate: c.subscription_expiry_date || '2027-12-31',
        maxStudentsAllowed: c.max_students_allowed || 600,
        subscriptionStatus: c.subscription_status || 'Active'
      }));
      setActiveColleges(mappedColleges);
    }

    // Fetch registration requests
    const requestsRes = await fetchPendingRequestsFromSupabase();
    if (requestsRes.success && Array.isArray(requestsRes.data)) {
      const mappedRequests = requestsRes.data.map(r => ({
        id: r.id,
        collegeName: r.college_name,
        city: r.city,
        state: r.state,
        contactName: r.contact_name,
        mobileNumber: r.mobile_number,
        email: r.email,
        status: r.status || 'Pending',
        submittedDate: r.submitted_date ? r.submitted_date.split('T')[0] : new Date().toISOString().split('T')[0],
        address: r.address,
        district: r.district,
        pinCode: r.pin_code,
        universityAffiliation: r.university_affiliation,
        pciApprovalNo: r.pci_approval_no,
        code: r.code,
        initials: r.initials,
        logoBg: r.logo_bg,
        subscriptionPlan: r.subscription_plan || 'Professional',
        subscriptionStartDate: r.subscription_start_date,
        subscriptionExpiryDate: r.subscription_expiry_date,
        maxStudentsAllowed: r.max_students_allowed || 600,
        subscriptionStatus: r.subscription_status || 'Active'
      }));
      setPendingRequests(mappedRequests);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  // Submit registration request (Public User)
  const submitRegistration = async (newRequestData) => {
    const exists = pendingRequests.some(
      req => req.email.toLowerCase() === newRequestData.email.toLowerCase() ||
             req.collegeName.toLowerCase() === newRequestData.collegeName.toLowerCase()
    );

    if (exists) {
      return { success: false, error: "A registration request for this college name or email address already exists." };
    }

    // 1. Send to Supabase
    const supabaseRes = await submitCollegeRegistrationToSupabase(newRequestData);

    const newRequest = {
      id: supabaseRes.data ? supabaseRes.data.id : `req_${Date.now()}`,
      collegeName: newRequestData.collegeName,
      city: newRequestData.city,
      state: newRequestData.state,
      contactName: newRequestData.contactName,
      mobileNumber: newRequestData.mobileNumber,
      email: newRequestData.email,
      submittedDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      address: `${newRequestData.city}, ${newRequestData.state}`,
      district: newRequestData.city,
      pinCode: "500001",
      universityAffiliation: "State Health Sciences University",
      pciApprovalNo: `PCI-${newRequestData.state.substring(0, 3).toUpperCase()}-2026/${Math.floor(100 + Math.random() * 900)}`,
      code: newRequestData.collegeName.split(' ').map(w => w[0]).join('').toUpperCase() + `-${newRequestData.city.substring(0, 3).toUpperCase()}`,
      initials: newRequestData.collegeName.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
      logoBg: "from-teal-600 to-emerald-700",
      subscriptionPlan: "Professional",
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      subscriptionExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      maxStudentsAllowed: 600,
      subscriptionStatus: "Active"
    };

    setPendingRequests(prev => [newRequest, ...prev]);
    return { success: true, data: newRequest };
  };

  // Approve College Request (Super Admin)
  const approveCollege = async (requestId) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return null;

    setPendingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Approved" } : r));

    // Send to Supabase
    const res = await approveCollegeInSupabase(request);

    const newActiveCollege = {
      id: res.data ? res.data.id : `clg_${Date.now()}`,
      name: request.collegeName,
      city: request.city,
      state: request.state,
      code: request.code || `${request.collegeName.substring(0, 4).toUpperCase()}-${request.city.substring(0, 3).toUpperCase()}`,
      studentsCount: request.maxStudentsAllowed || 350,
      accreditation: "PCI Approved",
      status: "Active Subscribed",
      portalUrl: `https://${(request.code || 'clg').toLowerCase()}.pharmdverse.com`,
      logoBg: request.logoBg || "from-emerald-600 to-teal-700",
      initials: request.initials || request.collegeName.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
      address: request.address,
      district: request.district,
      pinCode: request.pinCode,
      universityAffiliation: request.universityAffiliation,
      pciApprovalNo: request.pciApprovalNo,
      principalName: request.contactName,
      principalMobile: request.mobileNumber,
      principalEmail: request.email,
      requestId: request.id,
      subscriptionPlan: request.subscriptionPlan || "Professional",
      subscriptionStartDate: request.subscriptionStartDate || new Date().toISOString().split('T')[0],
      subscriptionExpiryDate: request.subscriptionExpiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      maxStudentsAllowed: request.maxStudentsAllowed || 600,
      subscriptionStatus: "Active"
    };

    setActiveColleges(prev => [newActiveCollege, ...prev]);
    return newActiveCollege;
  };

  // Reject College Request (Super Admin)
  const rejectCollege = (requestId) => {
    setPendingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Rejected" } : r));
  };

  // Update College Profile & Subscription Plan (Super Admin)
  const updateCollegeProfile = async (collegeId, updatedProfile) => {
    // Send update to Supabase
    await updateCollegeProfileInSupabase(collegeId, updatedProfile);

    setActiveColleges(prev => prev.map(clg => {
      if (clg.id === collegeId) {
        const isNowActive = updatedProfile.subscriptionStatus === 'Active';
        return {
          ...clg,
          name: updatedProfile.collegeName || clg.name,
          code: updatedProfile.collegeCode || clg.code,
          address: updatedProfile.address || clg.address,
          city: updatedProfile.city || clg.city,
          district: updatedProfile.district || clg.district,
          state: updatedProfile.state || clg.state,
          pinCode: updatedProfile.pinCode || clg.pinCode,
          universityAffiliation: updatedProfile.universityAffiliation || clg.universityAffiliation,
          pciApprovalNo: updatedProfile.pciApprovalNo || clg.pciApprovalNo,
          principalName: updatedProfile.principalName || clg.principalName,
          principalMobile: updatedProfile.principalMobile || clg.principalMobile,
          principalEmail: updatedProfile.principalEmail || clg.principalEmail,
          logoBg: updatedProfile.logoBg || clg.logoBg,
          initials: updatedProfile.collegeName ? updatedProfile.collegeName.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase() : clg.initials,
          subscriptionPlan: updatedProfile.subscriptionPlan || clg.subscriptionPlan,
          subscriptionStartDate: updatedProfile.subscriptionStartDate || clg.subscriptionStartDate,
          subscriptionExpiryDate: updatedProfile.subscriptionExpiryDate || clg.subscriptionExpiryDate,
          maxStudentsAllowed: updatedProfile.maxStudentsAllowed || clg.maxStudentsAllowed,
          subscriptionStatus: updatedProfile.subscriptionStatus || clg.subscriptionStatus,
          status: isNowActive ? "Active Subscribed" : "Inactive"
        };
      }
      return clg;
    }));
  };

  // DELETE SINGLE COLLEGE
  const deleteCollege = async (collegeId) => {
    await deleteCollegeFromSupabase(collegeId);
    setActiveColleges(prev => prev.filter(c => c.id !== collegeId));
    setPendingRequests(prev => prev.filter(r => r.id !== collegeId));
    setInactiveColleges(prev => prev.filter(c => c.id !== collegeId));
    setExpiredSubscriptions(prev => prev.filter(c => c.id !== collegeId));
  };

  // BULK DELETE MULTIPLE COLLEGES
  const deleteMultipleColleges = async (collegeIds) => {
    await deleteMultipleCollegesFromSupabase(collegeIds);
    const idsSet = new Set(collegeIds);
    setActiveColleges(prev => prev.filter(c => !idsSet.has(c.id)));
    setPendingRequests(prev => prev.filter(r => !idsSet.has(r.id)));
    setInactiveColleges(prev => prev.filter(c => !idsSet.has(c.id)));
    setExpiredSubscriptions(prev => prev.filter(c => !idsSet.has(c.id)));
  };

  return (
    <CollegeContext.Provider value={{
      activeColleges,
      pendingRequests,
      inactiveColleges,
      expiredSubscriptions,
      isLoading,
      loadSupabaseData,
      submitRegistration,
      approveCollege,
      rejectCollege,
      updateCollegeProfile,
      deleteCollege,
      deleteMultipleColleges
    }}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useColleges = () => useContext(CollegeContext);
