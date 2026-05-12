/*
  Warnings:

  - You are about to drop the column `fileUrls` on the `MedicalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `medicalRecordId` on the `MedicalHistory` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userEmail` to the `MedicalHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloodGroup` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyPhone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE');

-- DropForeignKey
ALTER TABLE "MedicalHistory" DROP CONSTRAINT "MedicalHistory_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_userId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "MedicalHistory" DROP COLUMN "fileUrls",
DROP COLUMN "medicalRecordId",
ADD COLUMN     "files" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bloodGroup" "BloodGroup" NOT NULL,
ADD COLUMN     "dob" TEXT,
ADD COLUMN     "emergencyName" TEXT NOT NULL,
ADD COLUMN     "emergencyPhone" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "height" TEXT,
ADD COLUMN     "medicalConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "weight" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("email");

-- DropTable
DROP TABLE "MedicalRecord";

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
