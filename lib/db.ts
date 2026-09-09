import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getKeywords() {
  const { data, error } = await supabase.from('keyword').select('*');
  if (error) throw error;
  return data;
}

export async function getKeyword(id: string) {
  const { data, error } = await supabase.from('keyword').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createKeyword(name: string) {
  const { data, error } = await supabase.from('keyword').insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteKeyword(id: string) {
  const { error } = await supabase.from('keyword').delete().eq('id', id);
  if (error) throw error;
}

export async function getVersions(keywordId: string) {
  const { data, error } = await supabase
    .from('version')
    .select('*')
    .eq('keyword_id', keywordId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAnalyzedUrls(versionId: string) {
  const { data, error } = await supabase
    .from('analyzed_url')
    .select('*')
    .eq('version_id', versionId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createVersion(keywordId: string, versionNumber: number, verdict: string, commercialCount: number, urls: any[]) {
  const { data: version, error: versionError } = await supabase
    .from('version')
    .insert({ keyword_id: keywordId, version_number: versionNumber, verdict, commercial_count: commercialCount })
    .select()
    .single();
  
  if (versionError) throw versionError;

  const urlsWithVersionId = urls.map(url => ({ ...url, version_id: version.id }));
  const { error: urlsError } = await supabase.from('analyzed_url').insert(urlsWithVersionId);
  
  if (urlsError) throw urlsError;
  
  return version;
}
