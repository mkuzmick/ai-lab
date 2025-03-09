import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs' // or nextra-theme-blog/custom theme

// Get the default MDX components
const themeComponents = getThemeComponents()

// Merge components
export function useMDXComponents(components: any = {}): any {
  return {
    ...themeComponents,
    ...components,
  }
}
