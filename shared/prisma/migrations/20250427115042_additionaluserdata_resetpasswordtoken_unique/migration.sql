/*
  Warnings:

  - A unique constraint covering the columns `[password_reset_token]` on the table `additional_user_data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "additional_user_data_password_reset_token_key" ON "additional_user_data"("password_reset_token");
