import bcrypt from 'bcrypt';
import User from '../../DB/models/user.model.js';
import { USER_ROLES } from '../../config/constants.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
} from '../../utils/jwt.js';
import {
    createConflictError,
    createForbiddenError,
    createUnauthorizedError
} from '../../utils/appError.js';

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export type RegisterUserInput = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: UserRole;
};

export type LoginCredentials = {
    email: string;
    password: string;
};

export const registerUserService = async (userData: RegisterUserInput) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw createConflictError('Email already in use.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        ...(userData.role === undefined ? {} : { role: userData.role })
    });

    const { password: _password, ...safeUser } = newUser.toObject();

    return safeUser;
};

export const loginUserService = async ({ email, password }: LoginCredentials) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createUnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw createUnauthorizedError('Invalid email or password.');
    }

    const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
    };

    const refreshToken = generateRefreshToken(tokenPayload);
    const accessToken = generateAccessToken(tokenPayload);

    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshToken.push({ token: refreshToken, expireAt });
    await user.save();

    const { password: _password, refreshToken: _refreshTokens, ...safeUser } = user.toObject();

    return { user: safeUser, accessToken, refreshToken };
};

export const logoutUserService = async (userId: string, refreshToken: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createUnauthorizedError('The user belonging to this token does no longer exist.');
    }

    user.set(
        'refreshToken',
        user.refreshToken.filter(
            storedToken => storedToken.token !== refreshToken
        )
    );
    await user.save();

    return true;
};

export const refreshTokenService = async (token: string) => {
    const decoded = verifyToken(token);
    if (!decoded.id) {
        throw createForbiddenError('Invalid Refresh Token');
    }

    const user = await User.findOne({
        _id: decoded.id,
        'refreshToken.token': token
    });
    if (!user) {
        throw createForbiddenError('Token used or expired. Please login again.');
    }

    const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.set(
        'refreshToken',
        user.refreshToken.filter(
            storedToken => storedToken.token !== token
        )
    );
    user.refreshToken.push({ token: newRefreshToken, expireAt });
    await user.save();

    return { newAccessToken, newRefreshToken };
};