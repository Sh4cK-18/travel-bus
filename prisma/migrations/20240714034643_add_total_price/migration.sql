/*
  Warnings:

  - You are about to drop the column `precio_total` on the `ruta` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `Boleto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `boleto` ADD COLUMN `totalPrice` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `ruta` DROP COLUMN `precio_total`;
