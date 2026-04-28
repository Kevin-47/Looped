
// import '@/lib/orpc.server'//pre rendering ssr

// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider } from "@/components/ui/theme-provider";
// import { AuthProvider } from "@/components/ui/AuthProvider";
// import { Providers } from './providers';
// import { Toaster } from '@/components/ui/sonner';



// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Teamflow",
//   description: "Project Management AI SASS app",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//    <AuthProvider>
//      <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             <Providers>
//               {children}
//               <Toaster closeButton position='top-center'/>
//             </Providers>
//           </ThemeProvider>
//       </body>
//     </html>
//    </AuthProvider>
//   );
// }

import '@/lib/orpc.server'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/components/ui/AuthProvider";
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teamflow",
  description: "Project Management AI SASS app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              {children}
              <Toaster closeButton position='top-center' />
            </Providers>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
