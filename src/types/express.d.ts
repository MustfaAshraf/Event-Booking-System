import type { UserDocument } from '../DB/models/user.model.ts';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}

export {};