import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { userId: session.user.id }
  });

  if (!record) {
    // Should not happen if registration is correct
    redirect("/register");
  }

  // Transform prisma data to match client component needs
  const userData = {
    fullName: record.fullName,
    bloodGroup: record.bloodGroup,
    emergencyPhone: record.emergencyPhone,
    emergencyName: record.emergencyName,
    emergencyRelation: record.emergencyRelation,
    allergies: record.allergies?.split(",").filter(Boolean) || [],
    medicalConditions: record.medicalConditions?.split(",").filter(Boolean) || [],
    photoUrl: record.photoUrl || undefined,
    medications: record.medications || undefined,
    organDonor: record.organDonor,
    publicId: record.id
  };

  return <DashboardClient initialData={userData} userId={session.user.id} />;
}
