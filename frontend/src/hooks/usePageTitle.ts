import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | LeagueTracker`;
    return () => {
      document.title = prev;
    };
  }, [title]);
};

