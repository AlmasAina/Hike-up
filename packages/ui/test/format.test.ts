import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fullName, slugify, stripHtml } from '../src/format';

describe('format helpers', () => {
  it('slugifies titles', () => {
    assert.equal(slugify('AC & HVAC Services'), 'ac-and-hvac-services');
    assert.equal(slugify('  Move-In / Move-Out Inspection '), 'move-in-move-out-inspection');
  });

  it('joins names', () => {
    assert.equal(fullName('Sara', null), 'Sara');
    assert.equal(fullName('Sara', 'Ali'), 'Sara Ali');
  });

  it('strips HTML and truncates', () => {
    assert.equal(stripHtml('<p>Hello <strong>world</strong></p>'), 'Hello world');
    assert.equal(stripHtml('<p>abcdefghij</p>', 5), 'abcd…');
  });
});
