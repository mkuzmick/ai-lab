import React from 'react'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'

// Generate static parameters for MDX pages.
export const generateStaticParams = generateStaticParamsFor('mdxPath')

// Type the metadata generation props.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ mdxPath: string[] }>
}): Promise<any> {
  const { mdxPath } = await params
  const { metadata } = await importPage(mdxPath)
  return metadata
}

// Pass an empty object to ensure an argument is provided.
const Wrapper = getMDXComponents({}).wrapper

export default async function Page({
  params,
  ...rest
}: {
  params: Promise<{ mdxPath: string[] }>
  [key: string]: any
}) {
  // Await the params to resolve the async Promise into an object.
  const resolvedParams = await params
  const result = await importPage(resolvedParams.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...rest} params={resolvedParams} />
    </Wrapper>
  )
}
