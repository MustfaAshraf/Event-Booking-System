import User from '../../DB/models/user.model.js';
import bcrypt from 'bcrypt';
import { generateRefreshToken, generateAccessToken, verifyToken } from '../../utils/jwt.js';
import { createConflictError, createForbiddenError, createUnauthorizedError } from '../../utils/appError.js';

export const registerUserService = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw createConflictError('Email already in use.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser = await User.create({
        ...userData,
        password: hashedPassword
    });

    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
};

export const loginUserService = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createUnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw createUnauthorizedError('Invalid email or password.');
    }

    const refreshToken = generateRefreshToken({ id: user._id, email: user.email, role: user.role })
    const accessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });

    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshToken.push({ token: refreshToken, expireAt });
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;

    return { user: userObject, accessToken, refreshToken };
};

export const logoutUserService = async (userId, refreshToken) => {
    const user = await User.findById(userId)
    user.refreshToken = user.refreshToken.filter(tk => tk.token !== refreshToken)
    await user.save()
    return true;
};

export const refreshTokenService = async (token) => {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) throw createForbiddenError('Invalid Refresh Token');

    const user = await User.findOne({ _id: decoded.id, 'refreshToken.token': token });
    if (!user) throw createForbiddenError('Token used or expired. Please login again.');

    const newAccessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id, email: user.email, role: user.role })
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshToken = user.refreshToken.filter((refreshToken) => refreshToken.token !== token);
    user.refreshToken.push({ token: newRefreshToken, expireAt });
    await user.save();

    return { newAccessToken, newRefreshToken };
};