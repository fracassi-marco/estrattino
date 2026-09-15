import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TransactionsProvider } from "../context/TransactionsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TransactionsProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: "Le mie spese", headerShown: false }} />
          <Stack.Screen
            name="month/[month]"
            options={{ title: "Dettaglio mese", headerShown: false }}
          />
        </Stack>
      </TransactionsProvider>
    </SafeAreaProvider>
  );
}
