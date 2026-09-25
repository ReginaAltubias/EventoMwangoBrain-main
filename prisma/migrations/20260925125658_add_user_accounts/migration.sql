-- AlterTable
ALTER TABLE "BrainUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pendente';

-- CreateIndex
CREATE UNIQUE INDEX "BrainUser_email_key" ON "BrainUser"("email");

