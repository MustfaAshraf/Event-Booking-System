import mongoose from 'mongoose';
import { USER_ROLES } from '../../config/constants.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER
    },
    refreshToken: [
        {
            token: String,
            expireAt: Date,
        }
    ]
}, { timestamps: true });

export type UserDocument = mongoose.HydratedDocument<
    mongoose.InferSchemaType<typeof userSchema>
>;

export default mongoose.model('User', userSchema);