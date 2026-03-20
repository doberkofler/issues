import {test, expect} from 'vitest';
import {sum} from '@alias_root/src/sum.js';

test('sum', () => expect(sum(1, 2)).toBe(3));
