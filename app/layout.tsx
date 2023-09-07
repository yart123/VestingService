import { Header } from '../src/components/header'
import '../src/styles/main_style.css'

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>
            <Header />
            {children}
        </body>
      </html>
    )
  }