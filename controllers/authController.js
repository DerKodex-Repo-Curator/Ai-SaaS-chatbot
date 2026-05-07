import { NextResponse } from "next/server";

import connectDB from "@/config/db";
import { isAdminEmail, requireAdmin } from "@/lib/auth/admin";
import {
  attachSessionCookie,
  clearSessionCookie,
  destroySession,
  getSessionIsAdmin,
  getSessionUserId,
  getOrCreateSessionId,
  setSessionUserId,
  SESSION_COOKIE_NAME,
} from "@/lib/session/store";
import User from "@/models/User";

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin ?? null,
});

const getRequestSessionId = (request) => {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
};

export const register = async (request) => {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 },
      );
    }

    const user = await User.create({ name, email, password });

    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: sanitizeUser(user),
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const login = async (request) => {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const { sessionId } = getOrCreateSessionId(getRequestSessionId(request));
    const isAdmin = isAdminEmail(user.email);

    setSessionUserId(sessionId, user._id.toString(), isAdmin);

    console.log("LOGIN SESSION:", {
      sessionId,
      userId: user._id.toString(),
      email: user.email,
      isAdmin,
    });

    const response = NextResponse.json({
      success: true,
      userId: user._id.toString(),
      email: user.email,
      isAdmin,
      message: "Login successful.",
      user: sanitizeUser(user),
    });

    attachSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const getMe = async (request) => {
  try {
    await connectDB();

    const sessionId = getRequestSessionId(request);
    const userId = getSessionUserId(sessionId);
    const isAdmin = getSessionIsAdmin(sessionId);

    console.log("AUTH ME SESSION:", {
      sessionId,
      userId,
      email: null,
      isAdmin,
    });

    if (!userId) {
      return NextResponse.json({
        success: false,
        userId: null,
        email: null,
        isAdmin: false,
        user: null,
      });
    }

    const user = await User.findById(userId).select("name email createdAt lastLogin");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          userId: null,
          email: null,
          isAdmin: false,
          user: null,
          message: "Session user no longer exists.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      email: user.email,
      isAdmin,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.log("AUTH ME ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const logout = async (request) => {
  const sessionId = getRequestSessionId(request);
  const userId = getSessionUserId(sessionId);
  const isAdmin = getSessionIsAdmin(sessionId);

  console.log("LOGOUT SESSION:", {
    sessionId,
    userId,
    isAdmin,
  });

  destroySession(sessionId);

  const response = NextResponse.json({
    success: true,
    userId: null,
    email: null,
    isAdmin: false,
    message: "Logout successful.",
  });

  clearSessionCookie(response);

  return response;
};

export const getUsers = async (request) => {
  const deniedResponse = requireAdmin(request);

  if (deniedResponse) {
    return deniedResponse;
  }

  try {
    await connectDB();

    const users = await User.find({})
      .select("name email createdAt lastLogin")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.log("GET USERS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
};
