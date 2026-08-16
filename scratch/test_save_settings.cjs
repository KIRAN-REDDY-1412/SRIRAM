const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

async function testSavePdfWithRealCollege() {
  const { data: colleges } = await supabase.from('colleges').select('id').limit(1);
  if (!colleges || !colleges.length) {
    console.log('No college found');
    return;
  }

  const collegeId = colleges[0].id;
  console.log('Using real College ID:', collegeId);

  const payload = {
    college_id: collegeId,
    show_college_logo: true,
    show_college_name: true,
    font_family: 'Times New Roman'
  };

  const { data: existing } = await supabase
    .from('document_branding_settings')
    .select('id')
    .eq('college_id', collegeId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase.from('document_branding_settings').update(payload).eq('id', existing.id).select();
    console.log('Update result:', { error, data: data?.[0] });
  } else {
    const { data, error } = await supabase.from('document_branding_settings').insert([payload]).select();
    console.log('Insert result:', { error, data: data?.[0] });
  }
}

testSavePdfWithRealCollege();
