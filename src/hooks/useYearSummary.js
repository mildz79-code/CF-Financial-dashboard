import { useEffect, useState } from 'react';
import { fetchYearSummary } from '../lib/financialData';

const initialState = {
  loading: true,
  error: null,
  data: null,
};

export const useYearSummary = (year = 2026, source = 'actual') => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await fetchYearSummary(year, source);
        if (!active) return;
        setState({ loading: false, error: null, data });
      } catch (err) {
        if (!active) return;
        setState({
          loading: false,
          error: err?.message || 'Failed to load year summary.',
          data: null,
        });
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [year, source]);

  return state;
};
