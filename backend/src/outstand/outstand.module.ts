import { Module, Global } from '@nestjs/common';
import { OutstandService } from './outstand.service';

@Global()
@Module({
  providers: [OutstandService],
  exports: [OutstandService],
})
export class OutstandModule {}
