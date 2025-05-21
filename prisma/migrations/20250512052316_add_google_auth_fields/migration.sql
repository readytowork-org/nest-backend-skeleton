-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_provider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "profile_picture" TEXT;
