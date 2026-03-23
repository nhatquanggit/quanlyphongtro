import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { stringifyJsonValue } from '../src/common/utils/json-field.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@phongtro.com' },
    update: {},
    create: {
      email: 'admin@phongtro.com',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '0123456789',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample property
  const property = await prisma.property.create({
    data: {
      name: 'Nhà Trọ Mẫu',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      totalFloors: 3,
      totalRooms: 15,
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      ownerId: admin.id,
    },
  });

  console.log('✅ Created sample property:', property.name);

  // Create sample rooms
  const rooms: any[] = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let room = 1; room <= 5; room++) {
      const roomNumber = `${floor}0${room}`;
      const createdRoom = await prisma.room.create({
        data: {
          propertyId: property.id,
          roomNumber,
          floor,
          type: room <= 2 ? 'SINGLE' : room <= 4 ? 'DOUBLE' : 'VIP',
          status: 'VACANT',
          price: room <= 2 ? 2000000 : room <= 4 ? 3000000 : 4500000,
          deposit: room <= 2 ? 2000000 : room <= 4 ? 3000000 : 4500000,
          area: room <= 2 ? 20 : room <= 4 ? 30 : 40,
          amenities: stringifyJsonValue({
            wifi: true,
            airConditioner: room > 2,
            waterHeater: true,
            kitchen: room > 4,
          }),
          description: `Phòng ${roomNumber} - Tầng ${floor}`,
        },
      });
      rooms.push(createdRoom);
    }
  }

  console.log(`✅ Created ${rooms.length} sample rooms`);

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Email: admin@phongtro.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
