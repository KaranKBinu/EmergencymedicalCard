"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const BLOOD_GROUP_MAP: Record<string, any> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};


export async function registerUser(formData: any) {
  const { 
    email, password, fullName, bloodGroup, gender, 
    emergencyName, emergencyPhone, dob, address,
    height, weight, allergies, medicalConditions, medicalNotes, photoUrl
  } = formData;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        bloodGroup: BLOOD_GROUP_MAP[bloodGroup] || "O_POSITIVE",
        gender: gender ? (gender.toUpperCase() as any) : null,
        emergencyName,
        emergencyPhone: emergencyPhone || "",
        dob: dob || "",
        address: address || "",
        height: height || "",
        weight: weight || "",
        medicalNotes: medicalNotes || "",
        photoUrl: photoUrl || null,
        allergies: allergies ? allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        medicalConditions: medicalConditions ? medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account" };
  }
}

export async function updateMedicalRecord(email: string, data: any) {
  try {
    const { history, bloodGroup, ...userData } = data;

    // Map blood group if it's in the UI format (e.g. "O+")
    const mappedBloodGroup = BLOOD_GROUP_MAP[bloodGroup] || bloodGroup;

    await prisma.user.update({
      where: { email },
      data: {
        ...userData,
        bloodGroup: mappedBloodGroup,
        // History is handled via a separate API or relation update
        // If updating history here:
        history: history ? {
          deleteMany: {},
          create: history.map((h: any) => ({
            title: h.title,
            date: h.date,
            description: h.description,
            files: h.files || []
          }))
        } : undefined
      }
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { error: "Update failed" };
  }
}
