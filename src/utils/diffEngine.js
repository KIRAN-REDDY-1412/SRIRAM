/**
 * Centralized All-Field Difference Engine for Clinical Cases
 * Compares current module data against preceptor return snapshot (snapshot_at_return)
 */

export const normalizeValue = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'string') return val.trim();
  return JSON.stringify(val);
};

export const areValuesEqual = (val1, val2) => {
  const norm1 = normalizeValue(val1);
  const norm2 = normalizeValue(val2);
  return norm1 === norm2;
};

/**
 * Compare two arrays of objects (e.g. Vitals, Labs, Prescribed Drugs, Points Covered)
 */
export const areArraysEqual = (arr1, arr2, matchKey = 'id') => {
  if (!Array.isArray(arr1) && !Array.isArray(arr2)) return true;
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  const str1 = JSON.stringify(arr1);
  const str2 = JSON.stringify(arr2);
  return str1 === str2;
};

/**
 * Main module diff calculator
 * @param {object} currentData - Current form state/DB row
 * @param {object} snapshotData - Snapshot recorded at preceptor return time
 * @param {string} moduleType - 'profile' | 'counselling' | 'intervention' | 'dir' | 'adr'
 * @returns {object} Map of modified field keys { [fieldKey]: { isModified: boolean, oldValue, newValue } }
 */
export const computeModuleDiffs = (currentData = {}, snapshotData = {}, moduleType = 'profile') => {
  const diffs = {};

  if (!snapshotData || Object.keys(snapshotData).length === 0) {
    return diffs;
  }

  // Iterate over all keys present in currentData or snapshotData
  const allKeys = new Set([...Object.keys(currentData), ...Object.keys(snapshotData)]);

  const IGNORED_KEYS = new Set([
    'id', 'created_at', 'updated_at', 'clinical_case_id', 'student_id', 'college_id',
    'status', 'approval_status', 'review_status', 'reviewed_at', 'preceptor_comments',
    'patient_profile_id'
  ]);

  allKeys.forEach((key) => {
    if (IGNORED_KEYS.has(key)) return;

    const currentVal = currentData[key];
    const snapshotVal = snapshotData[key];

    if (Array.isArray(currentVal) || Array.isArray(snapshotVal)) {
      if (!areArraysEqual(currentVal, snapshotVal)) {
        diffs[key] = {
          isModified: true,
          oldValue: snapshotVal,
          newValue: currentVal
        };
      }
    } else if (typeof currentVal === 'object' && currentVal !== null) {
      if (JSON.stringify(currentVal) !== JSON.stringify(snapshotVal)) {
        diffs[key] = {
          isModified: true,
          oldValue: snapshotVal,
          newValue: currentVal
        };
      }
    } else {
      if (!areValuesEqual(currentVal, snapshotVal)) {
        diffs[key] = {
          isModified: true,
          oldValue: snapshotVal,
          newValue: currentVal
        };
      }
    }
  });

  return diffs;
};

/**
 * Helper to check if a specific field is modified
 */
export const isFieldModified = (diffMap = {}, fieldKey) => {
  return Boolean(diffMap && diffMap[fieldKey] && diffMap[fieldKey].isModified);
};
