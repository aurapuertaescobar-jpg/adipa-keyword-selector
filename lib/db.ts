const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

export async function getKeywords() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/keyword`, { headers });
  if (!res.ok) throw new Error('Failed to fetch keywords');
  return res.json();
}

export async function getKeyword(id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/keyword?id=eq.${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch keyword');
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function createKeyword(name: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/keyword`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create keyword');
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function deleteKeyword(id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/keyword?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete keyword');
}

export async function getVersions(keywordId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/version?keyword_id=eq.${keywordId}&order=version_number.desc`, { headers });
  if (!res.ok) throw new Error('Failed to fetch versions');
  return res.json();
}

export async function getAnalyzedUrls(versionId: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/analyzed_url?version_id=eq.${versionId}&order=position.asc`, { headers });
  if (!res.ok) throw new Error('Failed to fetch analyzed URLs');
  return res.json();
}

export async function createVersion(keywordId: string, versionNumber: number, verdict: string, commercialCount: number, urls: any[]) {
  const versionRes = await fetch(`${SUPABASE_URL}/rest/v1/version`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ keyword_id: keywordId, version_number: versionNumber, verdict, commercial_count: commercialCount }),
  });
  if (!versionRes.ok) throw new Error('Failed to create version');
  const versionData = await versionRes.json();
  const version = Array.isArray(versionData) && versionData.length > 0 ? versionData[0] : null;
  if (!version) throw new Error('Failed to create version: no data returned');

  const urlsWithVersionId = urls.map(url => ({ ...url, version_id: version.id }));
  const urlsRes = await fetch(`${SUPABASE_URL}/rest/v1/analyzed_url`, {
    method: 'POST',
    headers,
    body: JSON.stringify(urlsWithVersionId),
  });
  if (!urlsRes.ok) throw new Error('Failed to create analyzed URLs');

  return version;
}
