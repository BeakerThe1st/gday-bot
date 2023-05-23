export const useEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `Attempted to use environment variable ${value} but is not defined.`
        );
    }
    return value;
};
