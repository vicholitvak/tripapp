import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { UserProfileProvider } from "../context/UserProfileContext";
import { OnboardingProvider } from "../context/OnboardingContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <title>Santurist - San Pedro de Atacama</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <UserProfileProvider>
              <OnboardingProvider>
                {children}
              </OnboardingProvider>
            </UserProfileProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
