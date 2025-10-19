import { Tabs } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { theme } from "@/theme";
import Icon from "@expo/vector-icons/Ionicons";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Icon>["name"];
  color?: string;
}) {
  return <Icon size={20} {...props} />;
}

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
      }}
    >
      <Tabs.Screen
        name={ROUTES.APP.HOME}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name={ROUTES.APP.AAC}
        options={{
          title: "AAC",
          tabBarIcon: ({ color }) => <TabBarIcon name="folder" color={color} />,
        }}
      />
      <Tabs.Screen
        name={ROUTES.APP.CHAT_AI}
        options={{
          title: "Chat AI",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="chatbubbles" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.APP.PROGRESS}
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.APP.PROFILE}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
