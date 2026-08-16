const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvzhrvrqtqwyhlptvnx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dnpocnZycXRxd3lobHB0dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTQ4ODUsImV4cCI6MjEwMTQzMDg4NX0.u5PeOuX7aX5NGcaJhImmdPIHiLatOOJCF80nHZ5pSvI'
);

// ALL VALID COLUMNS IN DB
const VALID_COLUMNS = new Set([
  'id', 'college_id', 'show_college_logo', 'show_college_name', 'show_autonomous',
  'show_hospital_logo', 'show_hospital_name', 'watermark_enabled', 'watermark_text_line1',
  'watermark_text_line2', 'watermark_opacity', 'watermark_position', 'footer_left_text',
  'footer_center_text', 'show_page_number', 'show_generated_datetime', 'paper_size',
  'orientation', 'margin_top', 'margin_bottom', 'margin_left', 'margin_right',
  'font_family', 'title_font_size', 'heading_font_size', 'body_font_size',
  'primary_color', 'secondary_color', 'table_header_color', 'border_color',
  'text_color', 'zebra_striping', 'repeat_table_header', 'show_student_signature',
  'show_preceptor_signature', 'created_at', 'updated_at', 'header_enabled',
  'footer_enabled', 'college_logo', 'hospital_logo', 'college_name',
  'autonomous_status', 'hospital_name', 'footer_text', 'watermark'
]);

async function verifyPayload() {
  const { data: colleges } = await supabase.from('colleges').select('id').limit(1);
  const collegeId = colleges[0].id;

  const pdfPayload = {
    show_college_logo: true,
    show_college_name: true,
    show_autonomous: true,
    show_hospital_logo: true,
    show_hospital_name: true,
    watermark_enabled: true,
    watermark_text_line1: 'PHARMDVERSE',
    watermark_text_line2: 'Clinical Documentation System',
    watermark_opacity: 10,
    watermark_position: 'Center',
    footer_left_text: 'PharmDVerse',
    footer_center_text: 'Confidential Clinical Documentation',
    show_page_number: true,
    show_generated_datetime: true,
    paper_size: 'A4',
    orientation: 'Portrait',
    margin_top: '15mm',
    margin_bottom: '15mm',
    margin_left: '15mm',
    margin_right: '15mm',
    font_family: 'Times New Roman',
    title_font_size: '16pt',
    heading_font_size: '14pt',
    body_font_size: '12pt',
    primary_color: '#0f172a',
    secondary_color: '#0284c7',
    table_header_color: '#f1f5f9',
    border_color: '#0f172a',
    text_color: '#0f172a',
    zebra_striping: false,
    repeat_table_header: true,
    repeat_header: true,
    repeat_footer: true,
    show_student_signature: true,
    show_preceptor_signature: true
  };

  const payload = {
    college_id: collegeId,
    show_college_logo: pdfPayload.show_college_logo ?? true,
    show_college_name: pdfPayload.show_college_name ?? true,
    show_autonomous: pdfPayload.show_autonomous ?? true,
    show_hospital_logo: pdfPayload.show_hospital_logo ?? true,
    show_hospital_name: pdfPayload.show_hospital_name ?? true,
    watermark_enabled: pdfPayload.watermark_enabled ?? true,
    watermark_text_line1: pdfPayload.watermark_text_line1 || 'PHARMDVERSE',
    watermark_text_line2: pdfPayload.watermark_text_line2 || 'Clinical Documentation System',
    watermark_opacity: parseInt(pdfPayload.watermark_opacity, 10) || 10,
    watermark_position: pdfPayload.watermark_position || 'Center',
    footer_left_text: pdfPayload.footer_left_text || 'PharmDVerse',
    footer_center_text: pdfPayload.footer_center_text || 'Confidential Clinical Documentation',
    show_page_number: pdfPayload.show_page_number ?? true,
    show_generated_datetime: pdfPayload.show_generated_datetime ?? true,
    paper_size: pdfPayload.paper_size || 'A4',
    orientation: pdfPayload.orientation || 'Portrait',
    margin_top: pdfPayload.margin_top || '15mm',
    margin_bottom: pdfPayload.margin_bottom || '15mm',
    margin_left: pdfPayload.margin_left || '15mm',
    margin_right: pdfPayload.margin_right || '15mm',
    font_family: pdfPayload.font_family || 'Times New Roman',
    title_font_size: pdfPayload.title_font_size || '16pt',
    heading_font_size: pdfPayload.heading_font_size || '14pt',
    body_font_size: pdfPayload.body_font_size || '12pt',
    primary_color: pdfPayload.primary_color || '#0f172a',
    secondary_color: pdfPayload.secondary_color || '#0284c7',
    table_header_color: pdfPayload.table_header_color || '#f1f5f9',
    border_color: pdfPayload.border_color || '#0f172a',
    text_color: pdfPayload.text_color || '#0f172a',
    zebra_striping: pdfPayload.zebra_striping ?? false,
    repeat_table_header: pdfPayload.repeat_table_header ?? true,
    header_enabled: pdfPayload.repeat_header ?? true,
    footer_enabled: pdfPayload.repeat_footer ?? true,
    show_student_signature: pdfPayload.show_student_signature ?? true,
    show_preceptor_signature: pdfPayload.show_preceptor_signature ?? true
  };

  // CHECK ALL KEYS IN PAYLOAD AGAINST DB VALID_COLUMNS
  const invalidKeys = Object.keys(payload).filter(k => !VALID_COLUMNS.has(k));
  if (invalidKeys.length > 0) {
    console.error('CRITICAL: Found invalid payload keys not in DB:', invalidKeys);
    return;
  }
  console.log('✅ ALL payload keys strictly match DB columns!');

  const { data: existing } = await supabase
    .from('document_branding_settings')
    .select('id')
    .eq('college_id', collegeId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase.from('document_branding_settings').update(payload).eq('id', existing.id).select();
    if (error) console.error('Update error:', error);
    else console.log('✅ Update SUCCESS! Returned ID:', data[0].id);
  }
}

verifyPayload();
