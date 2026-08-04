import React, { createContext, useContext, useState, useEffect } from 'react';

const CollegeContext = createContext();

export const CollegeProvider = ({ children }) => {
  // Initial states ready for Backend API integration
  const [activeColleges, setActiveColleges] = useState(() => {
    const saved = localStorage.getItem('pharmdverse_active_colleges');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [pendingRequests, setPendingRequests] = useState(() => {
    const saved = localStorage.getItem('pharmdverse_pending_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [inactiveColleges, setInactiveColleges] = useState([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState([]);

  useEffect(() => {
    localStorage.setItem('pharmdverse_active_colleges', JSON.stringify(activeColleges));
  }, [activeColleges]);

  useEffect(() => {
    localStorage.setItem('pharmdverse_pending_requests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  // Submit registration request (Public User)
  const submitRegistration = (newRequestData) => {
    const exists = pendingRequests.some(
      req => req.email.toLowerCase() === newRequestData.email.toLowerCase() ||
             req.collegeName.toLowerCase() === newRequestData.collegeName.toLowerCase()
    );

    if (exists) {
      return { success: false, error: "A registration request for this college name or email address already exists." };
    }

    const newRequest = {
      id: `req_${Date.now()}`,
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
  const approveCollege = (requestId) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return null;

    setPendingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Approved" } : r));

    const newActiveCollege = {
      id: `clg_${Date.now()}`,
      name: request.collegeName,
      city: request.city,
      state: request.state,
      code: request.code,
      studentsCount: request.maxStudentsAllowed || 350,
      accreditation: "PCI Approved",
      status: "Active Subscribed",
      portalUrl: `https://${request.code.toLowerCase()}.pharmdverse.com`,
      logoBg: request.logoBg,
      initials: request.initials,
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
  const updateCollegeProfile = (collegeId, updatedProfile) => {
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
  const deleteCollege = (collegeId) => {
    setActiveColleges(prev => prev.filter(c => c.id !== collegeId));
    setPendingRequests(prev => prev.filter(r => r.id !== collegeId));
    setInactiveColleges(prev => prev.filter(c => c.id !== collegeId));
    setExpiredSubscriptions(prev => prev.filter(c => c.id !== collegeId));
  };

  // BULK DELETE MULTIPLE COLLEGES (SELECT TO DELETE)
  const deleteMultipleColleges = (collegeIds) => {
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
