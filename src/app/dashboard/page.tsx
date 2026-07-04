import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.id.includes('@')) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.id },
    include: {
      history: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const userData = {
    fullName: user.fullName,
    bloodGroup: REVERSE_BLOOD_GROUP_MAP[user.bloodGroup] || user.bloodGroup,
    emergencyPhone: user.emergencyPhone,
    emergencyName: user.emergencyName,
    allergies: user.allergies,
    medicalConditions: user.medicalConditions,
    currentMedications: user.currentMedications,
    photoUrl: user.photoUrl || undefined,
    medications: user.medicalNotes || undefined, // Map medicalNotes back to medications for UI
    height: user.height || undefined,
    weight: user.weight || undefined,
    dob: user.dob || undefined,
    address: user.address || undefined,
    gender: user.gender || undefined,
    createdAt: user.createdAt,
    history: user.history.map(h => ({
      ...h,
      files: Array.isArray(h.files) ? h.files : []
    })),
    publicId: user.email // Using email as the public ID
  };

  return <DashboardClient initialData={userData} userId={user.email} />;
}
