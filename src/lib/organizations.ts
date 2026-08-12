import { supabase } from './supabase';
import { demoOrganization, isDemoMode } from './demo';

export type Organization = {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
};

export async function loadOrganization(): Promise<Organization | null> {
  if (isDemoMode) return demoOrganization;
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, website, created_at')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createOrganization(name: string, website: string) {
  if (isDemoMode) return { ...demoOrganization, name, website };
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, website: website || null })
    .select('id, name, website, created_at')
    .single();

  if (error) throw error;
  return data as Organization;
}
