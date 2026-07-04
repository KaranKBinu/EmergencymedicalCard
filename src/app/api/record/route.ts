import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    // session.user.id is now the email address
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      fullName, 
      bloodGroup, 
      emergencyName, 
      emergencyPhone, 
      allergies,
      medicalConditions,
      medications, // UI still sends this, we map to medicalNotes
      currentMedications,
      height,
      weight,
      photoUrl,
      address,
      dob,
      gender,
      history
    } = body;

    const userEmail = session.user.id;

    // Update the User table (Single table schema)
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        fullName,
        bloodGroup: BLOOD_GROUP_MAP[bloodGroup] || bloodGroup, // Map or use existing if already enum
        emergencyName,
        emergencyPhone,
        allergies: Array.isArray(allergies) ? allergies : [],
        medicalConditions: Array.isArray(medicalConditions) ? medicalConditions : [],
        currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
        medicalNotes: medications, // Renamed in schema
        height,
        weight,
        photoUrl,
        address,
        dob,
        gender: gender ? (gender.toUpperCase() as any) : undefined, // Ensure it matches Enum
        history: {
          deleteMany: {},
          create: (Array.isArray(history) ? history : []).map((h: any) => ({
            title: h.title || "",
            date: h.date || "",
            description: h.description || "",
            files: Array.isArray(h.files) ? h.files : []
          }))
        }
      },
      select: {
        email: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[RECORD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
