import { authService } from "../services/auth.services.js";
import { generateToken, setTokenCookie } from "../utils/jwt.utils.js";

export const register = async (req, res) => {
  try {
    const {name, email, password, role} = req.body;

    const user = await authService.createUser({name, email, password, role});

    const token = generateToken({ id: user.id, role: user.role });
    setTokenCookie(res, token); // set httpOnly cookie

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong while creating user",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await authService.authenticateUser(email, password);

    const token = generateToken({id: user.id, role: user.role});
    setTokenCookie(res, token); // set httpOnly cookie

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong while logging in",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while logging out",
    });
  }
};

export const verify = async (req, res) =>{
  try {
    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error verifying user",
    });
  }
};