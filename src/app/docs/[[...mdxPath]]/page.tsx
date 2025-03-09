import React from 'react'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

// Generate static parameters for MDX pages.
export const generateStaticParams = generateStaticParamsFor('mdxPath')

// Type the metadata generation props.
export async function generateMetadata({
  params,
}: {
  params: { mdxPath: string[] } | Promise<{ mdxPath: string[] }>
}): Promise<any> {
  const resolvedParams = await params
  const { metadata } = await importPage(resolvedParams.mdxPath)
  return metadata
}

// Pass an empty object to ensure an argument is provided.
const Wrapper = getMDXComponents({}).wrapper

// Define an interface for the page props.
interface PageProps {
  params: { mdxPath: string[] } | Promise<{ mdxPath: string[] }>
  [key: string]: any
}

// Use React.ReactElement as the return type
export default async function Page(props: PageProps): Promise<React.ReactElement> {
  const resolvedParams = await props.params
  const result = await importPage(resolvedParams.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={resolvedParams} />
    </Wrapper>
  )
}
