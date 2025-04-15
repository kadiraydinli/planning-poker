export interface ScaleType {
  name: string;
  values: string[];
  description: string;
}

export interface ScrumScales {
  [key: string]: ScaleType;
}

export const scrumScales: ScrumScales = {
  fibonacci: {
    name: 'Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '☕', '?'],
    description: '0, 1, 2, 3, 5, 8, 13...'
  },
  modified: {
    name: 'Modified Fibonacci',
    values: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '☕', '?'],
    description: '0, ½, 1, 2, 3, 5...'
  },
  tshirt: {
    name: 'T-Shirt',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '☕', '?'],
    description: 'XS, S, M, L, XL, XXL'
  },
  powers: {
    name: 'Powers of 2',
    values: ['0', '1', '2', '4', '8', '16', '32', '64', '☕', '?'],
    description: '0, 1, 2, 4, 8, 16...'
  }
};

export const getScaleValues = (scaleType: string): string[] => {
  return scrumScales[scaleType]?.values || scrumScales.fibonacci.values;
}; 