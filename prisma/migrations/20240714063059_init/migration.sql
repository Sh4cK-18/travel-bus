-- CreateTable
CREATE TABLE `Usuario` (
    `usuarioId` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`usuarioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `rolId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rol_name_key`(`name`),
    PRIMARY KEY (`rolId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRol` (
    `userRolId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserRol_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`userRolId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ruta` (
    `rutaId` INTEGER NOT NULL AUTO_INCREMENT,
    `salida` VARCHAR(191) NOT NULL,
    `llegada` VARCHAR(191) NOT NULL,
    `fecha_hora` DATETIME(3) NOT NULL,
    `puerta` VARCHAR(191) NOT NULL,
    `precio_adulto` DECIMAL(10, 2) NOT NULL,
    `precio_nino` DECIMAL(10, 2) NOT NULL,
    `precio_tercera_edad` DECIMAL(10, 2) NOT NULL,
    `cantidad_boletos` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`rutaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Boleto` (
    `boletoId` INTEGER NOT NULL AUTO_INCREMENT,
    `rutaId` INTEGER NOT NULL,
    `cantidad_adulto` INTEGER NOT NULL,
    `cantidad_nino` INTEGER NOT NULL,
    `cantidad_tercera_edad` INTEGER NOT NULL,
    `proceso_compra` ENUM('comprado', 'libre', 'reservado') NULL,
    `totalPrice` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`boletoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Compra` (
    `compraId` INTEGER NOT NULL AUTO_INCREMENT,
    `boletoId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `qrCode` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`compraId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRol` ADD CONSTRAINT `UserRol_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRol` ADD CONSTRAINT `UserRol_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Rol`(`rolId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Boleto` ADD CONSTRAINT `Boleto_rutaId_fkey` FOREIGN KEY (`rutaId`) REFERENCES `Ruta`(`rutaId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compra` ADD CONSTRAINT `Compra_boletoId_fkey` FOREIGN KEY (`boletoId`) REFERENCES `Boleto`(`boletoId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Compra` ADD CONSTRAINT `Compra_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`usuarioId`) ON DELETE CASCADE ON UPDATE CASCADE;
