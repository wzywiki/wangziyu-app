module.exports = {
  expo: {
    name: "王梓钰Wiki",
    slug: "wangziyu-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "wangziyuapp",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#f0eaf8",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.wzywiki.wangziyuapp",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#f0eaf8",
      },
      package: "com.wzywiki.wangziyuapp",
      versionCode: 1,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png",
    },
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "0865859a-7288-4e82-b95d-3fca2784641f",
      },
    },
  },
};
