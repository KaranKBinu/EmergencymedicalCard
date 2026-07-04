-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentMedications" TEXT[] DEFAULT ARRAY[]::TEXT[];
