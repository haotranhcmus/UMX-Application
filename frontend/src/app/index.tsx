import { useState } from "react";
import { View, Text, Button } from "react-native";
import { memo, useMemo } from "react";

const UserCard = memo(function UserCard({
  user,
}: {
  user: { name: string; email: string };
}) {
  console.log("UserCard rendered");

  return (
    <View>
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
    </View>
  );
});

export default function App() {
  const [count, setCount] = useState(0);
  const user = useMemo(() => ({ name: "Hao", email: "hao@email.com" }), []);

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button onPress={() => setCount(count + 1)} title="Increment" />

      {/* ❌ UserCard render LẠI mỗi khi count thay đổi */}
      <UserCard user={user} />
    </View>
  );
}

// Console output khi click button 3 lần:
// UserCard rendered
// UserCard rendered
// UserCard rendered
