import PublicEmergencyProfile from "@/components/PublicEmergencyProfile";

export default function PublicViewPage() {
  // Mock data for the public view
  const mockEmergencyData = {
    fullName: "Karan K Binu",
    bloodGroup: "O+",
    emergencyName: "Binu K",
    emergencyPhone: "+91 98765 43210",
    medicalConditions: ["Asthma", "Type 1 Diabetes"],
    allergies: ["Peanuts", "Penicillin", "Latex"],
    medications: "Takes Insulin daily. Carrying inhaler in right pocket.",
    organDonor: true,
  };

  return <PublicEmergencyProfile data={mockEmergencyData} />;
}
