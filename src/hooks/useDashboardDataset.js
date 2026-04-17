import { useEffect, useState } from 'react';
import { fetchDashboardDataset } from '../lib/financialData';

const initialState = {
  loading: true,
  error: null,
  data: null,
};

export const useDashboardDataset = (year = 2026) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await fetchDashboardDataset(year);
        if (!active) return;
        setState({ loading: false, error: null, data });
      } catch (err) {
        if (!active) return;
        setState({
          loading: false,
          error: err?.message || 'Failed to load dashboard dataset.',
          data: null,
        });
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [year]);

  return state;
};
