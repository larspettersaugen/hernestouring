-- CreateTable
CREATE TABLE "TourDateTask" (
    "id" TEXT NOT NULL,
    "tourDateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourDateTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TourDateTask" ADD CONSTRAINT "TourDateTask_tourDateId_fkey" FOREIGN KEY ("tourDateId") REFERENCES "TourDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
