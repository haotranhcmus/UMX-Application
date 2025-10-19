// src/theme/typography.ts
import { Typography } from "./theme.types";

export const typography: Typography = {
  fontFamily: {
    primary: {
      regular: "OpenSans-Regular", // <-- Name must match the one used in useFonts
      bold: "OpenSans-Bold", // <-- Name must match the one used in useFonts
    },
    // If you have a secondary font, you can define it here
    // secondary: {
    //   regular: 'Montserrat-Regular',
    //   bold: 'Montserrat-Bold',
    // }
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 44,
  },
};
