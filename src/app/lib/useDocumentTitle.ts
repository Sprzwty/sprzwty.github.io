import { useEffect } from 'react';

const SITE_NAME = 'Wang Tongyu';

/** Sets document.title to "<title> · Wang Tongyu" while the component is mounted. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
