// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect } from 'estuaire';
import { generateRoute } from '../src/createRoutes';

describe('zete:routes', () => {
  expect(generateRoute('app/index.svelte')).toEqual({ route: '/app/', props: [] });
  expect(generateRoute('app/index/index.svelte')).toEqual({ route: '/app/index/', props: [] });

  expect(generateRoute('app/index/[slug]')).toEqual({ route: '/app/index/:slug', props: ['slug'] });
  expect(generateRoute('app/[foo]/[bar]')).toEqual({ route: '/app/:foo/:bar', props: ['foo', 'bar'] });

  expect(generateRoute('app/[...path].tsx')).toEqual({ route: '/app/*', props: ['path'] });
});
