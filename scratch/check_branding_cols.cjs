const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

async function checkColumns() {
  const { data, error } = await supabase.from('document_branding_settings').select('*').limit(1);
  if (error) {
    console.error('Error fetching document_branding_settings:', error);
  } else {
    console.log('Columns in document_branding_settings:', Object.keys(data[0] || {}));
  }
}

checkColumns();
