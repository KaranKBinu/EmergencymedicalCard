import { prisma } from "@/lib/prisma";
import PublicEmergencyProfile from "@/components/PublicEmergencyProfile";
import { notFound } from "next/navigation";

export default async function PublicViewPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const record = await prisma.medicalRecord.findUnique({
    where: { id }
  });

  if (!record) {
    notFound();
  }

  const medicalData = {
    fullName: record.fullName,
    photoUrl: record.photoUrl || undefined,
    bloodGroup: record.bloodGroup,
    emergencyName: record.emergencyName,
    emergencyPhone: record.emergencyPhone,
    medicalConditions: record.medicalConditions?.split(",").filter(Boolean) || [],
    allergies: record.allergies?.split(",").filter(Boolean) || [],
    medications: record.medications || undefined,
    organDonor: record.organDonor,
  };

  return <PublicEmergencyProfile data={medicalData} />;
}
