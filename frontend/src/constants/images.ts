// Export all images from assets for easy use
export const Images = {
  // Main assets
  adaptiveIcon: require("../../assets/adaptive-icon.png"),
  favicon: require("../../assets/favicon.png"),
  icon: require("../../assets/icon.png"),
  splashIcon: require("../../assets/splash-icon.png"),

  // Images folder
  avatar: require("../../assets/images/avatar.png"),
  welcomeScreenImg: require("../../assets/images/welcome-screen-img.png"),
  logo: require("../../assets/images/logo.png"),

  // Screen specific images
  homeScreenImg: require("../../assets/images/home-screen-img.png"),
  createReportImg: require("../../assets/images/create-report-img.png"),

  // Face icons
  calmFace: require("../../assets/images/faces/calm-face.png"),
  laughingFace: require("../../assets/images/faces/laughing-face.png"),
  angryFace: require("../../assets/images/faces/angry-face.png"),
  smileFace: require("../../assets/images/faces/smile-face.png"),
  sadFace: require("../../assets/images/faces/sad-face.png"),
} as const;

// Type cho autocomplete
export type ImageKeys = keyof typeof Images;
