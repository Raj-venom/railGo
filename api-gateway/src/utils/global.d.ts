declare global {
    namespace Express {
        interface Request {
            logger?: any;
            user?: { id: string };
        }
    }
}
export { };