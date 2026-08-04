import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchActiveCollegesFromSupabase, 
  fetchRegistrationRequestsFromSupabase, 
  submitCollegeRegistrationToSupabase, 
  approveCollegeInSupabase, 
  updateCollegeProfileAndSubscriptionInSupabase, 
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

  // STEP 3 & STEP 7: Pure Live Supabase Fetch
  const loadSupabaseData = async () => {
    setIsLoading(true);
    console.log('[CollegeContext] Loading live data from Supabase PostgreSQL...');
    
    // 1. Fetch Active Colleges for Landing Page (from colleges table)
    const collegesRes = await fetchActiveCollegesFromSupabase();
    if (collegesRes.success && Array.isArray(collegesRes.data)) {
      const mappedColleges = collegesRes.data.map(c => {
        const sub = c.subscriptions && c.subscriptions[0] ? c.subscriptions[0] : null;
        return {
          id: c.id,
          name: c.college_name || c.name,
          code: c.college_code || c.code,
          city: c.city,
          state: c.state,
          district: c.district,
          pinCode: c.pincode || c.pin_code,
          address: c.address,
          universityAffiliation: c.university_affiliation,
          pciApprovalNo: c.pci_approval_number || c.pci_approval_no,
          principalName: c.principal_name,
          principalMobile: c.principal_mobile,
          principalEmail: c.principal_email,
          logoBg: c.college_logo || c.logo_bg || 'from-emerald-600 to-teal-700',
          initials: (c.college_name || c.name) ? (c.college_name || c.name).split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase() : 'CLG',
          studentsCount: sub ? sub.maximum_students : 600,
          portalUrl: `https://${(c.college_code || c.code || 'clg').toLowerCase()}.pharmdverse.com`,
          status: c.status || 'Active',
          subscriptionPlan: sub ? sub.plan_name : 'Professional',
          subscriptionStartDate: sub ? sub.subscription_start_date : new Date().toISOString().split('T')[0],
          subscriptionExpiryDate: sub ? sub.subscription_expiry_date : '2027-12-31',
          maxStudentsAllowed: sub ? sub.maximum_students : 600,
          subscriptionStatus: sub ? sub.status : 'Active'
        };
      });

      const activeList = mappedColleges.filter(c => c.status === 'Active');
      const inactiveList = mappedColleges.filter(c => c.status === 'Inactive');
      const expiredList = mappedColleges.filter(c => c.status === 'Expired');

      setActiveColleges(activeList);
      setInactiveColleges(inactiveList);
      setExpiredSubscriptions(expiredList);
    } else {
      setActiveColleges([]);
      setInactiveColleges([]);
      setExpiredSubscriptions([]);
    }

    // 2. Fetch Registration Requests for Super Admin (from registration_requests table)
    const requestsRes = await fetchRegistrationRequestsFromSupabase();
    if (requestsRes.success && Array.isArray(requestsRes.data)) {
      const mappedRequests = requestsRes.data.map(r => ({
        id: r.id,
        collegeName: r.college_name,
        city: r.city,
        state: r.state,
        contactName: r.contact_person || r.contact_name,
        mobileNumber: r.mobile_number,
        email: r.email,
        status: r.status || 'Pending',
        submittedDate: r.submitted_at ? r.submitted_at.split('T')[0] : (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        address: `${r.city}, ${r.state}`,
        district: r.city,
        pinCode: '500001',
        universityAffiliation: 'State Health Sciences University',
        pciApprovalNo: `PCI-${r.state.substring(0, 3).toUpperCase()}-2026/100`,
        code: r.college_name.split(' ').map(w => w[0]).join('').toUpperCase() + `-${r.city.substring(0, 3).toUpperCase()}`,
        initials: r.college_name.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
        logoBg: 'from-teal-600 to-emerald-700',
        subscriptionPlan: 'Professional',
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionExpiryDate: '2027-12-31',
        maxStudentsAllowed: 600,
        subscriptionStatus: 'Active'
      }));
      setPendingRequests(mappedRequests);
    } else {
      setPendingRequests([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  // STEP 2: Submit Registration Request
  const submitRegistration = async (newRequestData) => {
    console.log('[CollegeContext] Submitting new registration request:', newRequestData);
    const result = await submitCollegeRegistrationToSupabase(newRequestData);

    if (result.success) {
      await loadSupabaseData(); // Refresh directly from Supabase
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  };

  // STEP 4: Approve College Request
  const approveCollege = async (requestId) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return null;

    console.log('[CollegeContext] Approving request:', requestId);
    const result = await approveCollegeInSupabase(request);

    if (result.success) {
      await loadSupabaseData(); // Refresh directly from Supabase
      return result.data;
    }
    return null;
  };

  // Reject College Request
  const rejectCollege = async (requestId) => {
    console.log('[CollegeContext] Rejecting request:', requestId);
    setPendingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Rejected" } : r));
  };

  // STEP 5 & STEP 6: Update College Profile & Assign Subscription Plan
  const updateCollegeProfile = async (collegeId, updatedProfile) => {
    console.log('[CollegeContext] Updating profile and subscription plan for college:', collegeId);
    const result = await updateCollegeProfileAndSubscriptionInSupabase(collegeId, updatedProfile);

    if (result.success) {
      await loadSupabaseData(); // Refresh directly from Supabase
    }
  };

  // Delete Single College
  const deleteCollege = async (collegeId) => {
    console.log('[CollegeContext] Deleting college:', collegeId);
    await deleteCollegeFromSupabase(collegeId);
    await loadSupabaseData();
  };

  // Bulk Delete Multiple Colleges
  const deleteMultipleColleges = async (collegeIds) => {
    console.log('[CollegeContext] Bulk deleting colleges:', collegeIds);
    await deleteMultipleCollegesFromSupabase(collegeIds);
    await loadSupabaseData();
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
