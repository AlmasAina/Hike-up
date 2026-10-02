import { applyDecorators } from '@nestjs/common';
import { Matches, MaxLength } from 'class-validator';

/** International or local phone number: digits, spaces, dashes, parentheses and an optional leading +. */
export const PHONE_REGEX = /^\+?[0-9][0-9\s\-()]{6,19}$/;

export const IsPhone = () =>
  applyDecorators(MaxLength(32), Matches(PHONE_REGEX, { message: 'must be a valid phone number' }));

/** Hex colour (#RGB, #RRGGBB or #RRGGBBAA). */
export const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Password policy: at least 8 characters with a letter and a number. */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;
export const PASSWORD_MESSAGE = 'password must be 8–128 characters and include a letter and a number';
