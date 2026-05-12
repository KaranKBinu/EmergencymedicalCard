import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch non-array fields to avoid Prisma mapping bug with adapter-pg
  const record = await prisma.medicalRecord.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      fullName: true,
      bloodGroup: true,
      emergencyPhone: true,
      emergencyName: true,
      emergencyRelation: true,
      photoUrl: true,
      medications: true,
      organDonor: true,
      height: true,
      weight: true,
      dob: true,
      address: true,
      createdAt: true,
      gender: true,
      pastSurgeries: true
    }
  });

  if (!record) {
    redirect("/register");
  }

  // Fetch array fields via raw query to bypass mapping issues
  const rawRecordData: any[] = await prisma.$queryRaw`
    SELECT "allergies", "medicalConditions" 
    FROM "MedicalRecord" 
    WHERE "userId" = ${session.user.id}
  `;

  // Fetch history separately to avoid nested mapping issues
  const historyItems = await prisma.medicalHistory.findMany({
    where: { medicalRecordId: record.id },
    select: {
      id: true,
      title: true,
      date: true,
      description: true,
      createdAt: true
    }
  });

  // Fetch raw fileUrls for history
  const rawHistoryData: any[] = await prisma.$queryRaw`
    SELECT "id", "fileUrls" 
    FROM "MedicalHistory" 
    WHERE "medicalRecordId" = ${record.id}
  `;

  const parseArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.startsWith('{')) {
      return val.replace(/^{|}$/g, '').split(',').map(v => v.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
    return [];
  };

  const allergies = parseArray(rawRecordData[0]?.allergies);
  const medicalConditions = parseArray(rawRecordData[0]?.medicalConditions);

  const historyWithFiles = historyItems.map(item => {
    const rawItem = rawHistoryData.find(h => h.id === item.id);
    return {
      ...item,
      fileUrls: parseArray(rawItem?.fileUrls)
    };
  });

  const userData = {
    fullName: record.fullName,
    bloodGroup: record.bloodGroup,
    emergencyPhone: record.emergencyPhone,
    emergencyName: record.emergencyName,
    emergencyRelation: record.emergencyRelation,
    allergies,
    medicalConditions,
    photoUrl: record.photoUrl || undefined,
    medications: record.medications || undefined,
    organDonor: record.organDonor,
    height: record.height || undefined,
    weight: record.weight || undefined,
    dob: record.dob,
    address: record.address || undefined,
    createdAt: record.createdAt,
    history: historyWithFiles,
    publicId: record.id
  };

  return <DashboardClient initialData={userData} userId={session.user.id} />;
}
