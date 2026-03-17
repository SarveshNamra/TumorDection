import bcrypt from "bcryptjs";
import db from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";

// Object to handle user authentication
export const authService = {
  // Method to create a new user
  async createUser({name, email, password, role}) {
    const existingUser = await db.user.findUnique({
      where: {email},
    });

    if(existingUser){
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || UserRole.RADIOLOGIST,
      },
      select: {   // To select only the necessary fields
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return newUser;
  
  },

  // Method to authenticate a user
  async authenticateUser(email, password){
    const user = await db.user.findUnique({
      where: {email},
    });

    if(!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if(!isPasswordMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // To remove password from response and return only the necessary fields except password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Method to get user by id
  async getUserById(userId){
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if(!user){
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  },
};