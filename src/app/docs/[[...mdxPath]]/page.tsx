import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

// Generate static parameters for all MDX pages.
export const generateStaticParams = generateStaticParamsFor('mdxPath')

// Type the props for generateMetadata.
export async function generateMetadata({
  params,
}: {
  params: { mdxPath: string[] } | Promise<{ mdxPath: string[] }>
}) {
  const resolvedParams = await params
  const { metadata } = await importPage(resolvedParams.mdxPath)
  return metadata
}

// Call getMDXComponents with an empty object so that the parameter is provided.
const Wrapper = getMDXComponents({}).wrapper

// Define an interface for the page props.
// Extend with [key: string]: any if other props may be present.
interface PageProps {
  params: { mdxPath: string[] } | Promise<{ mdxPath: string[] }>
  [key: string]: any
}

export default async function Page(props: PageProps) {
  const resolvedParams = await props.params
  const result = await importPage(resolvedParams.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={resolvedParams} />
    </Wrapper>
  )
}
