import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import { ReactNode } from 'react'
 
export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}
 
// const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>
const navbar = (
  <Navbar
    logo={<b>AI Lab Docs</b>}
    // ... Your additional navbar options
  />
)
const footer = <Footer>made in the AI Lab.</Footer>
 
export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
      <div >
        <Layout
          // banner={banner}
          darkMode={false} 
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/process-black/ai-lab/tree/main/src/content"
          footer={footer}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </div>
  )
}