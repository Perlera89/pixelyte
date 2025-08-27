import { Module } from '@nestjs/common';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [WishlistModule],
})
export class AppModule {}
