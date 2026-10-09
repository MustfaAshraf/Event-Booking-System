import mongoose from "mongoose";
import { config } from "../config/env.js";

export const dbConnection = async () => {
    try {
        if (!config.MONGODB_URI) {
            throw new Error('MONGODB_URI is not configured.');
        }
        await mongoose.connect(config.MONGODB_URI);
        console.log(`DB Connected...`);
    } catch (error) {
        console.error('DB Connection Failed:', error);
        process.exit(1);
    }
};