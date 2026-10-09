import type { UserDocument } from '../DB/models/user.model.js';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
        }
    }
}

export {};