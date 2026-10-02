import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as accessible without authentication. A valid token, if present, is still read. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
