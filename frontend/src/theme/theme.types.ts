// Define the structure for the font families you use
export type FontFamily = {
  regular: string;
  bold: string;
  italic?: string; // ? means this property is optional
  light?: string;
};

// Define the structure for the entire typography section
export type Typography = {
  fontFamily: {
    primary: FontFamily; // For example, your primary font is Lato
    secondary?: FontFamily; // And your secondary font is Montserrat
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
};

// Define the structure for the color palette
export type Colors = {
  primary: string;
  secondary: string;
  background: string;
  backgroundLight: string;
  text: string;
  textLight: string;
  error: string;
  success: string;
  border: string;
  borderDark: string;
  white: string;
  shadow: string;
  blueLight: string;
  gray: string;
  yellow: string;
  info: string;
};

// Define the structure for the layout
export type Layout = {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
};

// Finally, combine everything into a single AppTheme
export type AppTheme = {
  colors: Colors;
  typography: Typography;
  layout: Layout;
};
