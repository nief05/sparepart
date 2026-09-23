import { PrismaClient, Role, RepairStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Checking database initialization...");

  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log("Database already initialized with user records. Skipping seed.");
    return;
  }

  console.log("Fresh database detected. Seeding initial admin and demo data...");

  // 1. Create 1 Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Administrator",
      email: "admin@rbm.com",
      password: hashPassword("admin123"),
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // 2. Create 3 Sample Spareparts
  const part1 = await prisma.sparepart.create({
    data: {
      sku: "LCD-IP13-OLED",
      name: "LCD Screen OLED iPhone 13",
      brand: "Apple OEM",
      buyPrice: 650000,
      sellPrice: 1100000,
      stock: 12,
      minStockAlert: 3,
    },
  });

  const part2 = await prisma.sparepart.create({
    data: {
      sku: "BAT-SAM-S23",
      name: "Battery 3900mAh Galaxy S23",
      brand: "Samsung Original",
      buyPrice: 220000,
      sellPrice: 450000,
      stock: 8,
      minStockAlert: 2,
    },
  });

  const part3 = await prisma.sparepart.create({
    data: {
      sku: "FLX-CHG-IP14",
      name: "Charging Port Flex iPhone 14",
      brand: "Apple OEM",
      buyPrice: 95000,
      sellPrice: 250000,
      stock: 15,
      minStockAlert: 5,
    },
  });
  console.log(`Created 3 spareparts: ${part1.sku}, ${part2.sku}, ${part3.sku}`);

  // 3. Create Sample Customer and 1 Repair Ticket
  const customer = await prisma.customer.create({
    data: {
      name: "Budi Santoso",
      phone: "081234567890",
      address: "Jl. Sudirman No. 45, Jakarta Pusat",
    },
  });

  const ticket = await prisma.repairTicket.create({
    data: {
      ticketNo: "TKT-20260908-001",
      customerId: customer.id,
      deviceBrand: "Apple",
      deviceModel: "iPhone 13 128GB",
      imeiSn: "356789012345678",
      passcode: "123456",
      complaint: "Layar pecah retak dan touch screen tidak merespons setelah terjatuh",
      status: RepairStatus.PROGRESS,
      estCost: 1200000,
      downPayment: 300000,
      totalCost: 1200000,
      technicianId: adminUser.id,
      partsUsed: {
        create: [
          {
            sparepartId: part1.id,
            quantity: 1,
            price: part1.sellPrice,
          },
        ],
      },
    },
    include: {
      partsUsed: true,
    },
  });
  console.log(`Created sample repair ticket: ${ticket.ticketNo}`);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
