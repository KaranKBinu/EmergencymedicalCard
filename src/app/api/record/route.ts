import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      fullName, 
      bloodGroup, 
      emergencyName, 
      emergencyPhone, 
      emergencyRelation,
      allergies,
      medicalConditions,
      medications,
      height,
      weight,
      organDonor,
      photoUrl,
      address
    } = body;

    const record = await prisma.medicalRecord.update({
      where: { userId: session.user.id },
      data: {
        fullName,
        bloodGroup,
        emergencyName,
        emergencyPhone,
        emergencyRelation,
        allergies: Array.isArray(allergies) ? allergies.join(",") : allergies,
        medicalConditions: Array.isArray(medicalConditions) ? medicalConditions.join(",") : medicalConditions,
        medications,
        height,
        weight,
        organDonor,
        photoUrl,
        address
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("[RECORD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
