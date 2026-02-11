import { Controller, Get } from '@nestjs/common';
import { STARTER_PACKS } from '../../../seed/starter-packs';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('starter-packs')
export class StarterPacksController {
  @Public()
  @Get()
  list() {
    const previews = STARTER_PACKS.map((pack) => ({
      key: pack.key,
      label: pack.label,
      description: pack.description,
      accountsPreview: pack.accounts.slice(0, 3).map((a) => ({ name: a.name, type: a.type })),
      categoriesPreview: pack.categories
        .filter((c) => c.type === 'expense')
        .slice(0, 5)
        .map((c) => c.name),
    }));
    return { packs: previews };
  }
}
