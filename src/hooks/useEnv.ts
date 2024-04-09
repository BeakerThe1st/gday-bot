export const useEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Attempted to read environment variable ${value} but it is not defined.`,
    );
  }
  return value;
};
