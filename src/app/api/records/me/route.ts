import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { medicalRecordSchema } from '@/lib/validations';

// Force Re-Build Salt: 772211-v2

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { userId: session.user.id },
      include: { history: true },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = medicalRecordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, dob, bloodGroup, height, weight, medicalConditions, medicineAllergies, commonAllergies, emergencyContact, address, medicalNotes, optionalFields, history } = result.data;

    // Update the record
    const updatedRecord = await prisma.medicalRecord.update({
      where: { userId: session.user.id },
      data: {
        name,
        dob,
        bloodGroup,
        height,
        weight,
        medicalConditions,
        medicineAllergies,
        commonAllergies,
        emergencyContact,
        address,
        medicalNotes,
        optionalFields,
      },
    });

    // Handle history updates (simple way: delete all and recreate)
    if (history && Array.isArray(history)) {
      await prisma.medicalHistory.deleteMany({
        where: { recordId: updatedRecord.id },
      });

      if (history.length > 0) {
        await prisma.medicalHistory.createMany({
          data: history.map((h: any) => ({
            recordId: updatedRecord.id,
            date: h.date,
            description: h.description,
            notes: h.notes || '',
          })),
        });
      }
    }

    const finalRecord = await prisma.medicalRecord.findUnique({
      where: { id: updatedRecord.id },
      include: { history: true },
    });

    return NextResponse.json(finalRecord);
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
