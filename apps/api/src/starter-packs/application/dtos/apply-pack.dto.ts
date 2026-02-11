import { IsIn } from 'class-validator';

const PACK_KEYS = ['personal', 'family', 'freelancer', 'student', 'empty'] as const;

export class ApplyPackDto {
  @IsIn(PACK_KEYS)
  packKey: (typeof PACK_KEYS)[number];
}
