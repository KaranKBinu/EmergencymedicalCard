import { prisma } from "@/lib/prisma";
import PublicEmergencyProfile from "@/components/PublicEmergencyProfile";
import { notFound } from "next/navigation";

export default async function PublicViewPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Use select to avoid Prisma mapping bug with array fields
  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      photoUrl: true,
      bloodGroup: true,
      emergencyName: true,
      emergencyPhone: true,
      medications: true,
      address: true,
      dob: true,
      createdAt: true,
      organDonor: true
    }
  });

  if (!record) {
    notFound();
  }

  // Fetch array fields via raw query to bypass mapping issues
  const rawRecordData: any[] = await prisma.$queryRaw`
    SELECT "allergies", "medicalConditions" 
    FROM "MedicalRecord" 
    WHERE "id" = ${id}
  `;

  // Fetch history separately
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

  const medicalData = {
    fullName: record.fullName,
    photoUrl: record.photoUrl || undefined,
    bloodGroup: record.bloodGroup,
    emergencyName: record.emergencyName,
    emergencyPhone: record.emergencyPhone,
    medicalConditions,
    allergies,
    medications: record.medications || undefined,
    address: record.address || undefined,
    dob: record.dob,
    createdAt: record.createdAt,
    organDonor: record.organDonor,
    history: historyWithFiles,
  };

  return <PublicEmergencyProfile data={medicalData} />;
}
