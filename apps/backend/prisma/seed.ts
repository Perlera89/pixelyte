import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@pixelyte.com';
  const adminPassword = 'Test1234!';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        names: 'Admin',
        surnames: 'Pixelyte',
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log('Usuario administrador creado');
  } else {
    console.log('El usuario administrador ya existe');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
