import { describe, expect, it } from 'vitest';
import { parseQuickAddTranscript } from '../../src/services/phase8QuickAddParser.js';

describe('parseQuickAddTranscript', () => {
  it.each([
    ['add two litres of milk and a loaf of bread', ['milk', 'bread']],
    ['buy 1 kg rice plus 500 grams dal', ['rice', 'dal']],
    ['get me six eggs and two packets chips', ['egg', 'chips']],
    ['add half kilo onions and 3 tomatoes', ['onion', 'tomato']],
    ['please add one bottle oil with two packs atta', ['oil', 'atta']],
    ['add 2 l coke and 1 loaf bread', ['coke', 'bread']],
    ['buy a dozen eggs and one litre milk', ['egg', 'milk']],
    ['add 4 pieces banana and 2 kg potatoes', ['banana', 'potato']],
  ])('parses "%s"', (transcript, names) => {
    const parsed = parseQuickAddTranscript(transcript);
    expect(parsed.map(item => item.product_name)).toEqual(names);
  });
});
