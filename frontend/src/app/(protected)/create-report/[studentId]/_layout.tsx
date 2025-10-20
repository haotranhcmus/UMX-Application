import { Stack } from "expo-router";
import DomainProvider from "@/providers/DomainProvider";

const CreateReportLayout = () => {
  return (
    <DomainProvider>
      <Stack>
        {/* <Stack.Screen name="index" /> */}
        {/* <Stack.Screen name="[studentId]" /> */}
      </Stack>
    </DomainProvider>
  );
};

export default CreateReportLayout;
