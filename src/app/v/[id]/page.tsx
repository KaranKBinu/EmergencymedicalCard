import { prisma } from "@/lib/prisma";
import PublicEmergencyProfile from "@/components/PublicEmergencyProfile";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

const REVERSE_BLOOD_GROUP_MAP: Record<string, string> = {
  "A_POSITIVE": "A+",
  "A_NEGATIVE": "A-",
  "B_POSITIVE": "B+",
  "B_NEGATIVE": "B-",
  "AB_POSITIVE": "AB+",
  "AB_NEGATIVE": "AB-",
  "O_POSITIVE": "O+",
  "O_NEGATIVE": "O-",
};

export default async function PublicViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user;
  // Decode the ID if it was URL encoded (since it's an email)
  const email = decodeURIComponent(id);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      history: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const medicalData = {
    fullName: user.fullName,
    photoUrl: user.photoUrl || undefined,
    bloodGroup: REVERSE_BLOOD_GROUP_MAP[user.bloodGroup] || user.bloodGroup,
    emergencyName: user.emergencyName,
    emergencyPhone: user.emergencyPhone,
    medicalConditions: user.medicalConditions,
    allergies: user.allergies,
    currentMedications: user.currentMedications,
    medications: user.medicalNotes || undefined, // Map medicalNotes to medications for the component
    address: user.address || undefined,
    dob: user.dob || undefined,
    history: user.history.map(h => ({
      ...h,
      files: Array.isArray(h.files) ? h.files : []
    })),
  };

  return <PublicEmergencyProfile data={medicalData} isLoggedIn={isLoggedIn} />;
}
