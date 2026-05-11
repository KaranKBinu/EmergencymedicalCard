"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: any) {
  const { email, password, fullName, bloodGroup, emergencyName, emergencyPhone, emergencyRelation } = formData;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        medicalRecord: {
          create: {
            fullName,
            bloodGroup,
            dob: "TBD", // Placeholder to be updated in full form
            emergencyName,
            emergencyPhone,
            emergencyRelation,
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
}

export async function updateMedicalRecord(userId: string, data: any) {
  try {
    await prisma.medicalRecord.update({
      where: { userId },
      data: {
        ...data,
        medicalConditions: Array.isArray(data.medicalConditions) ? data.medicalConditions.join(",") : data.medicalConditions,
        allergies: Array.isArray(data.allergies) ? data.allergies.join(",") : data.allergies,
      }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Update failed" };
  }
}
