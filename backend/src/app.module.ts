import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutstandModule } from './outstand/outstand.module';
import { AccountsModule } from './accounts/accounts.module';
import { ConnectModule } from './connect/connect.module';
import { PostsModule } from './posts/posts.module';
import { MediaModule } from './media/media.module';
import { NetworksModule } from './networks/networks.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OutstandModule,
    AccountsModule,
    ConnectModule,
    PostsModule,
    MediaModule,
    NetworksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
