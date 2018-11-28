import { camelToKebab, capitalize } from './string.utils';

test('camel to kebab', () => {
  expect(camelToKebab('testCase')).toBe('test-case');
});
test('capitalize', () => {
  expect(capitalize('testcase')).toBe('Testcase');
});
