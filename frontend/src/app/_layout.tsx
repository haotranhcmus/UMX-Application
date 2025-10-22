import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function Layout() {
  const [loaded, error] = useFonts({
    "OpenSans-Regular": require("../../assets/fonts/open-sans-regular.ttf"),
    "OpenSans-Bold": require("../../assets/fonts/open-sans-bold.ttf"),
  });

  // Wait for fonts to load before rendering the app
  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(protected)" />
    </Stack>
  );
}
