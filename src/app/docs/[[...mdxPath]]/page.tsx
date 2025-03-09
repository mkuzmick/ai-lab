import React from 'react'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

// Generate static parameters for MDX pages.
export const generateStaticParams = generateStaticParamsFor('mdxPath')

// Type the metadata generation props.
export async function generateMetadata({
  params,
}: {
  params: { mdxPath: string[] }
}): Promise<any> {
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

// Pass an empty object to ensure an argument is provided.
const Wrapper = getMDXComponents({}).wrapper

// Define an interface for the page props.
interface PageProps {
  params: { mdxPath: string[] }
  [key: string]: any
}
export default async function Page({ params, ...rest }: { params: { mdxPath: string[] }; [key: string]: any }) {
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...rest} params={params} />
    </Wrapper>
  )
}

