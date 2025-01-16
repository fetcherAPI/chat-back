-- AlterTable
ALTER TABLE "message" ADD COLUMN     "chatGroupId" TEXT;

-- CreateTable
CREATE TABLE "chat_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "chat_group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_chatGroupId_fkey" FOREIGN KEY ("chatGroupId") REFERENCES "chat_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
