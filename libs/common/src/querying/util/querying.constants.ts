export const DefaultPageSize = {
  USER: 10,
  PROPERTY: 6,
  VISIT: 4,
  CONTRACTS: 4,
} as const satisfies Record<string, number>;

export const MAX_PAGE_SIZE = 100;
export const MAX_PAGE_NUMBER = 25;
