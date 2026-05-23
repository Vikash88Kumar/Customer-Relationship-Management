import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import connect from "./index.js";

dotenv.config({
  path: "./.env"
});

const defaultUsers = [
  {
    name: "Pooja Patel",
    email: "pooja@forge.com",
    password: "password123",
    role: "BDA",
    phoneNumber: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    isActive: true
  },
  {
    name: "Vikash Kumar",
    email: "vikash@forge.com",
    password: "password123",
    role: "BDA",
    phoneNumber: "+91 99999 88888",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    isActive: true
  },
  {
    name: "Neha Sharma",
    email: "neha@forge.com",
    password: "password123",
    role: "BDA_Manager",
    phoneNumber: "+91 91234 56789",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    isActive: true
  }
];

const seedUsers = async () => {
  try {
    console.log("Connecting to MONGODB to seed users...");
    await connect();
    console.log("MONGODB Connected successfully!");

    for (const u of defaultUsers) {
      console.log(`Checking if user "${u.email}" already exists...`);
      const existingUser = await User.findOne({ email: u.email });

      if (existingUser) {
        console.log(`User "${u.email}" already exists. Updating details and password...`);
        existingUser.name = u.name;
        existingUser.role = u.role;
        existingUser.password = u.password; // pre-save hook will hash it automatically
        existingUser.phoneNumber = u.phoneNumber;
        existingUser.avatar = u.avatar;
        existingUser.isActive = u.isActive;
        await existingUser.save();
        console.log(`Successfully updated: ${u.email}`);
      } else {
        console.log(`Creating user "${u.email}"...`);
        const newUser = new User(u);
        await newUser.save();
        console.log(`Successfully created: ${u.email}`);
      }
    }

    console.log("\n-----------------------------------------");
    console.log("SELECTION OF SEEDED USERS FOR WORKSPACE LOGIN:");
    console.log("-----------------------------------------");
    console.log("1. Pooja Patel (Senior BDA)");
    console.log("   - Email: pooja@forge.com");
    console.log("   - Password: password123");
    console.log("   - Role: BDA");
    console.log("2. Vikash Kumar (Sales Agent BDA)");
    console.log("   - Email: vikash@forge.com");
    console.log("   - Password: password123");
    console.log("   - Role: BDA");
    console.log("3. Neha Sharma (BDA Manager)");
    console.log("   - Email: neha@forge.com");
    console.log("   - Password: password123");
    console.log("   - Role: BDA_Manager");
    console.log("-----------------------------------------\n");

    console.log("Database user seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error.message);
    process.exit(1);
  }
};

seedUsers();
