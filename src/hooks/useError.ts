export const useError = (error: any) => {
    console.error(`[ERROR]: ${error}`);
    console.dir(error);
};
