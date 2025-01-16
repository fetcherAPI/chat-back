-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_chatGroupId_fkey";

-- CreateTable
CREATE TABLE "group_message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "chatGroupId" TEXT,

    CONSTRAINT "group_message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_message" ADD CONSTRAINT "group_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_message" ADD CONSTRAINT "group_message_chatGroupId_fkey" FOREIGN KEY ("chatGroupId") REFERENCES "chat_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
