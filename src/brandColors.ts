/**
 * Slush brand colour ramps, extracted from "Slush colors.pdf".
 * Four hues, each light → dark.
 */
export interface BrandRamp {
  name: string;
  colors: string[];
}

export const BRAND_RAMPS: BrandRamp[] = [
  {
    name: 'Red',
    colors: ['#ffd1c4', '#ffa186', '#ff8062', '#ff5127', '#f12200', '#c10800', '#a20000', '#780100', '#571102'],
  },
  {
    name: 'Pink',
    colors: ['#ffcee4', '#ffaacd', '#f77dac', '#fa5997', '#eb1478', '#bb015d', '#9b004c', '#710136', '#530c29'],
  },
  {
    name: 'Purple',
    colors: ['#dcd8fd', '#c1b6fd', '#af9dff', '#9f83fb', '#895ffa', '#702de6', '#5d0dc9', '#420893', '#2e1f5c'],
  },
  {
    name: 'Blue',
    colors: ['#c8dfff', '#9ec7fe', '#70b0ff', '#4697ff', '#0079fa', '#005fd4', '#004ea8', '#003984', '#002c61'],
  },
];
