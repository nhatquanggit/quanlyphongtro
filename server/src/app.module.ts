import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as path from 'path';
import { PrismaModule } from '@common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BannersModule } from './modules/banners/banners.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), 'server/.env'),
        path.resolve(process.cwd(), '.env'),
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10,
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PropertiesModule,
    RoomsModule,
    TenantsModule,
    ContractsModule,
    InvoicesModule,
    PaymentsModule,
    MaintenanceModule,
    ExpensesModule,
    DashboardModule,
    ReportsModule,
    BannersModule,
    NotificationsModule,
    FilesModule,
    SettingsModule,
  ],
})
export class AppModule {}
