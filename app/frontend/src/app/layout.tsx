import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { UserProfileProvider } from "../context/UserProfileContext";
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
              {children}
            </UserProfileProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
