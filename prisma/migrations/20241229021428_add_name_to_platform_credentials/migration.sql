/*
  Warnings:

  - Added the required column `name` to the `PlatformCredential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlatformCredential" ADD COLUMN     "name" TEXT NOT NULL;
