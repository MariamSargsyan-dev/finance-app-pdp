import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './common/decorators/public.decorator';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { ApplyStarterPackUseCase } from './starter-packs/application/apply-starter-pack.use-case';
import { ApplyPackDto } from './starter-packs/application/dtos/apply-pack.dto';

@Controller()
export class AppController {
  constructor(private readonly applyStarterPackUseCase: ApplyStarterPackUseCase) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('starter-packs')
  async applyStarterPack(@Body() dto: ApplyPackDto, @CurrentUser() user: { id: string }) {
    return this.applyStarterPackUseCase.execute(user.id, dto.packKey);
  }
}
