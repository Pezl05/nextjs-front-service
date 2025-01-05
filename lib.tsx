export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };
    return new Date(dateString).toLocaleString(undefined, options);
};

export const logger = {
    info: (message: string) => {
      console.log(`${new Date().toISOString().replace('T', ' ').slice(0, 19)} [INFO] [Next.js] - ${message}`);
    },
    warn: (message: string) => {
      console.warn(`${new Date().toISOString().replace('T', ' ').slice(0, 19)} [WARN] [Next.js] - ${message}`);
    },
    error: (message: string) => {
      console.error(`${new Date().toISOString().replace('T', ' ').slice(0, 19)} [ERROR] [Next.js] - ${message}`);
    }
  };
  