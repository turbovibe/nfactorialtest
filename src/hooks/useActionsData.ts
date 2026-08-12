import { useCallback, useEffect, useState } from 'react';
import { loadActionsData } from '../lib/actions';
import type { ActionsData } from '../lib/actionTypes';
import { loadOrganization, type Organization } from '../lib/organizations';

export function useActionsData() {
  const [organization, setOrganization] = useState<Organization | null>();
  const [data, setData] = useState<ActionsData | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');
      const nextOrganization = await loadOrganization();
      setOrganization(nextOrganization);
      if (nextOrganization) setData(await loadActionsData(nextOrganization.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load actions.');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { organization, data, error, refresh };
}
