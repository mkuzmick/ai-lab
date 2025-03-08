I'll research how to properly configure Nextra so it handles only the `/docs` subpath in your Next.js app while ensuring internal links and sidebar links resolve correctly within that subfolder. I'll also check alternative documentation solutions like Docusaurus in case Nextra doesn't fully support your requirements.

I'll update you once I find relevant details.

# Configuring Nextra for a `/docs` Subpath in a Next.js App (App Router)

Setting up Nextra (a Markdown docs framework for Next.js) to handle only the `/docs` section of your site is possible with Next.js 13/14 using the App Router. The goal is to have Nextra power all routes under `/docs/**` (with its own sidebar, MDX pages, etc.) without interfering with the rest of your Next.js pages. Below is a step-by-step guide covering the App Router setup, internal link handling, necessary config, and alternatives if needed.

## 1. Install Nextra and Choose the Docs Theme

Make sure you have **Nextra v4** or above, since Nextra 4 is built for the Next.js App Router (older versions only worked with the Pages router) ([Nextra 4 x App Router. What's New and Migration Guide (The Guild)](https://the-guild.dev/blog/nextra-4#:~:text=App%20Router%20Support)). Install Nextra and the docs theme package in your project:

```bash
npm install nextra nextra-theme-docs
# or yarn add / pnpm add as appropriate
```

Nextra provides a Next.js plugin (`nextra()`) which we will use in the Next.js config. It will transform MDX files into pages and apply the docs theme.

## 2. Update `next.config.js` for Nextra (with `/docs` Base Path)

In your Next.js config, wrap the export with Nextra’s plugin configuration. You can specify that the documentation content lives under a certain base path (e.g. `/docs`) so that Nextra only generates routes under that URL prefix. For example:

```js
// next.config.js or next.config.mjs
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',  // path to theme config (if using one)
  contentDir: 'content',             // directory for MDX content (default is "content")
  contentDirBasePath: '/docs'        // serve the content under the "/docs" path
});
module.exports = withNextra({
  // Other Next.js config options here...
});
```

In the above, `contentDirBasePath: '/docs'` tells Nextra that all MDX content should be served from the `/docs` URL segment ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=next)). This ensures the rest of your Next.js app routes (e.g. marketing pages) are untouched by Nextra. You can adjust `contentDir` if your MDX files are in a custom location (by default, Nextra looks for a `content/` directory at the project root).

**Note:** If you are using ES modules for your config (`next.config.mjs`), use `import nextra from 'nextra'` and `export default withNextra({ ... })` syntax as shown in Nextra’s docs ([Docs Theme | Nextra](https://nextra.site/docs/docs-theme/start#:~:text=import%20nextra%20from%20%27nextra%27)).

## 3. Organize Your Documentation Content Files

Create a folder (by default named `content/`) to hold your documentation markdown/MDX files. Inside this content folder, organize your docs pages. Since we set `contentDirBasePath: '/docs'`, it’s conventional to put all docs files under a subfolder named `docs` within `content`. For example:

```
content/
└── docs/
    ├── index.mdx           # becomes "/docs" homepage for docs
    ├── getting-started.mdx # becomes "/docs/getting-started"
    └── folder1/
        ├── my-doc-1.mdx    # becomes "/docs/folder1/my-doc-1"
        └── my-doc-2.mdx    # becomes "/docs/folder1/my-doc-2"
```

This structure mirrors the URLs you want under `/docs`. Nextra will later generate a sidebar navigation from this file tree. You can include a top-level `content/index.mdx` if you also want a docs-style homepage at the root of the site (e.g. `/`), but if your main site’s homepage is separate, you might omit `content/index.mdx` and only use `content/docs`.

## 4. Add a Catch-all Route in the Next.js App Router for Docs

Next, you need to add a special **catch-all route** in your Next.js `app` directory to render the MDX content. This catch-all file will funnel all requests under `/docs/*` to Nextra’s MDX page loader. Create the file: `app/docs/[[...mdxPath]]/page.jsx` (i.e. a folder named `docs`, inside it a dynamic folder `[[...mdxPath]]` with a `page.jsx`). This setup ensures it only catches routes under the `/docs` segment.

**Example `app/docs/[[...mdxPath]]/page.jsx`:**

```jsx
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../../../mdx-components' 
// (The mdx-components file is for any custom MDX components, see note below)

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata({ params }) {
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page({ params, ...props }) {
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
```

This is the basic boilerplate provided by Nextra for the content catch-all route ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=import%20,components)) ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=const%20Wrapper%20%3D%20getMDXComponents%28%29)). Here’s what it does:

- `importPage` (from `nextra/pages`) dynamically imports the MDX file corresponding to the path. For example, if the request is `/docs/folder1/my-doc-2`, then `params.mdxPath` will be `['folder1','my-doc-2']` and `importPage` will load `content/docs/folder1/my-doc-2.mdx`.
- `generateStaticParams = generateStaticParamsFor('mdxPath')` enables Next.js to know all static paths for pre-rendering (it will crawl the `content/docs` files) so that all doc pages can be statically generated at build time.
- `generateMetadata` pulls any frontmatter metadata from the MDX (like title/description) to integrate with Next.js 13+ SEO metadata API.
- It uses a `Wrapper` component (provided by Nextra’s MDX context) to wrap the page content. This wrapper is essentially the docs theme layout that includes the sidebar, navigation, table of contents, etc., so that each MDX page is rendered inside the docs layout. Inside the wrapper, the MDX content is rendered via `<MDXContent />` and the table of contents (`toc`) and `metadata` are passed in as props.

**MDX Components:** In the import statements above, `mdx-components` refers to a file where you can define or override components for MDX (e.g., custom rendering for code blocks, or the wrapper itself). Nextra will provide a default wrapper if you don't create a custom `mdx-components`. In many cases, you can simply import `getMDXComponents` from `'nextra/mdx'` to get Nextra’s default components. The example above assumes you have a local `mdx-components.js` exporting a `useMDXComponents` function that merges any custom components with the defaults ([nextra/examples/docs/src/app/docs/[[...mdxPath]]/page.jsx at main · shuding/nextra · GitHub](https://github.com/shuding/nextra/blob/main/examples/docs/src/app/docs/%5B%5B...mdxPath%5D%5D/page.jsx#:~:text=import%20,from%20%27nextra%2Fpages)). If you have no custom MDX components, you can omit that and try:

```jsx
import { importPage } from 'nextra/pages'
import { useMDXComponents } from 'nextra/mdx'

const Wrapper = useMDXComponents().wrapper;
...
```

_(Check Nextra’s documentation for the latest on custom MDX components setup.)_

After adding this route file, your Next.js app knows how to handle any request starting with `/docs` by loading the appropriate MDX content.

**Project Structure Recap:** At this point, your project structure might look like:

```
app/
├── (site)/layout.jsx       # (optional) layout for main site section
├── (site)/page.jsx         # (optional) main site pages in a route group
├── docs/
│   ├── [[...mdxPath]]/
│   │   └── page.jsx        # catch-all for docs content (as above)
│   └── layout.jsx          # (optional) layout for docs section
└── page.jsx                # maybe your main homepage if not using route groups
content/
└── docs/
    └── ... (.mdx files for docs) 
next.config.js
```

For example, one developer who integrated Nextra docs into an existing site used a structure with a `(default)` group for regular pages and a separate `app/docs` section for docs ([Cannot import react in mdx files · Issue #4096 · shuding/nextra · GitHub](https://github.com/shuding/nextra/issues/4096#:~:text=app%20%E2%94%9C%E2%94%80%E2%94%80%20,tsx%20%E2%94%82%C2%A0%C2%A0%20%E2%94%9C%E2%94%80%E2%94%80%20pricing)) ([Cannot import react in mdx files · Issue #4096 · shuding/nextra · GitHub](https://github.com/shuding/nextra/issues/4096#:~:text=%E2%94%82%C2%A0%C2%A0%20%E2%94%94%E2%94%80%E2%94%80%20terms,mdxPath)). This keeps the docs routing and layout isolated from the rest of the app.

## 5. Using a Dedicated Layout for Docs (Optional)

By default, Nextra’s `Wrapper` (as used above) already provides the docs layout (sidebar, nav, etc.) for the content pages. However, you might want to further customize or isolate the layout for the docs section. Next.js allows **nested layouts**, so you can create a `app/docs/layout.jsx` to wrap all documentation pages.

In many cases, you may not need a custom docs layout file at all – the `Wrapper` from Nextra will include the standard docs theme chrome. But if you want to, for example, add a custom banner, change the docs navbar, or ensure the main site’s layout (header/footer) doesn’t appear on docs pages, you can use a separate layout. For instance:

```jsx
// app/docs/layout.jsx
import { Layout, Navbar, Footer } from 'nextra-theme-docs';
import 'nextra-theme-docs/style.css';

export default function DocsLayout({ children }) {
  return (
    <Layout 
      navbar={<Navbar title="MyProject Docs" />}
      footer={<Footer />}
      // ...other layout props like logo, sidebar toggle defaults, etc.
    >
      {children}
    </Layout>
  );
}
```

This uses Nextra’s provided `<Layout>` component from the docs theme to wrap all docs pages ([Docs Theme | Nextra](https://nextra.site/docs/docs-theme/start#:~:text=,getPageMap)). You can pass in `navbar`, `footer`, or other props (or use Nextra’s default ones). In practice, many projects simply rely on the default docs theme layout, but the option is there if you need more control. If you do create a `app/docs/layout.jsx`, it will be used instead of the global `app/layout.jsx` for pages under `/docs`. (You should still keep a minimal `app/layout.jsx` at the root for the HTML `<html><body>` structure and perhaps your main site’s global styles or providers.)

Using route groups can help separate the main site and docs. For example, putting your main site pages in `app/(site)/...` with their own `layout.jsx`, and the docs in `app/(docs)/docs/...` with a different layout. This way, the two sections don’t share layout unless you want them to.

## 6. Ensuring Internal Links and Sidebar Navigation Work Correctly

With the above configuration, all your docs pages will be accessible at URLs like `/docs/<slug>`. To make sure internal links in your documentation point to the right URLs (including the `/docs` prefix):

- **Use relative links in MDX:** When writing links in your MDX files, prefer relative paths or include the `/docs` base. For example, to link to `my-doc-2.mdx` in the same folder, you can simply do `[See next page](my-doc-2.mdx)` (or omit the `.mdx` extension). Nextra will convert markdown links to Next.js `<Link>` components automatically ([Next.js Link | Nextra](https://nextra.site/docs/guide/link#:~:text=Next)) ([Next.js Link | Nextra](https://nextra.site/docs/guide/link#:~:text=Click%20)), preserving the correct route. Relative links ensure the `/docs` segment is kept. **Avoid using absolute links without the `/docs` prefix**. For instance, if you wrote `[Next Page](/folder1/my-doc-2)`, it would link to `/folder1/my-doc-2` on your site (missing the `/docs`), which is not what you want. Instead, either write `[Next Page](/docs/folder1/my-doc-2)` (absolute with `/docs`) or `[Next Page](../folder1/my-doc-2.mdx)` (relative), depending on context.
    
- **Sidebar links:** Nextra’s docs theme will automatically generate a sidebar menu based on your folder structure and any `_meta` files. By default, every MDX page appears in the sidebar. Since our docs live under a `docs/` folder in the content, you might see a top-level “docs” section in the sidebar navigation. If your docs are the only content in the sidebar, you may not want a redundant “docs” parent item. To hide this, you can use a special meta configuration file.
    

**Hiding the "docs" parent in the sidebar:** Create a file `_meta.json` (or `_meta.js`) in the **content root** (or in `content/docs` depending on how you want to organize it). For example, at `content/_meta.json`, you could add:

```json
{
  "docs": {
    "title": "Docs",
    "display": "hidden",
    "type": "page"
  }
}
```

This tells Nextra that the top-level `docs` folder should be hidden from the sidebar (`display: "hidden"`), even though its pages will still be accessible at `/docs/...`. In a Next.js 14 integration tutorial, the author used a similar `_meta.json` to hide the “docs” label in the sidebar ([Integrating Nextra Documentation into NextJS 14: A Quick Tutorial | by Adijsad | Level Up Coding](https://levelup.gitconnected.com/integrating-nextra-documentation-into-nextjs-14-a-quick-tutorial-28a99ff7f7a4#:~:text=%7B%20,)). With the above config, users will directly see the pages under docs (like “Getting Started”, etc.) in the sidebar, without an extra nesting level for "docs". The `type: "page"` in the config also indicates that “Docs” could be treated as a top-level page (for example, it could appear in the top navigation if not hidden), but since we also hid it, it won’t show up in either the top nav or sidebar. The result: the sidebar will list your doc pages as if “docs” is the root, which is usually the desired UX.

Optionally, you can use the `_meta` file to add a link back to your main site’s home. For example, you might add a `"home"` entry with `href: "/"` and `type: "page"`, so that a “Home” link appears in the top navbar of the docs site that points to your main homepage ([Integrating Nextra Documentation into NextJS 14: A Quick Tutorial | by Adijsad | Level Up Coding](https://levelup.gitconnected.com/integrating-nextra-documentation-into-nextjs-14-a-quick-tutorial-28a99ff7f7a4#:~:text=%7D%2C%20,)). This is a convenient way to let users jump from the docs back to the rest of your site. For instance:

```json
{
  "docs": { "display": "hidden", "type": "page" },
  "home": { "title": "Home", "href": "/", "type": "page" }
}
```

The above would produce a hidden “Docs” in sidebar (so its children show directly) and a visible “Home” link in the top menu bar pointing to `/` ([Integrating Nextra Documentation into NextJS 14: A Quick Tutorial | by Adijsad | Level Up Coding](https://levelup.gitconnected.com/integrating-nextra-documentation-into-nextjs-14-a-quick-tutorial-28a99ff7f7a4#:~:text=%7B%20,)) ([Integrating Nextra Documentation into NextJS 14: A Quick Tutorial | by Adijsad | Level Up Coding](https://levelup.gitconnected.com/integrating-nextra-documentation-into-nextjs-14-a-quick-tutorial-28a99ff7f7a4#:~:text=This%20hides%20displaying%20,com%2Fshuding%2Fnextra%2Fissues%2F291)). Adjust titles and hrefs as needed.

## 7. Verification and Testing

With the content files in place, the catch-all route, and config updated, run your app (`npm run dev`) and navigate to `/docs` in the browser. You should see Nextra’s documentation UI (with your content). Verify that:

- The docs homepage (`/docs` or `/docs/index`) loads your `content/docs/index.mdx`.
- Subpages like `/docs/folder1/my-doc-2` load the corresponding MDX.
- The sidebar shows your pages. (If you used `_meta.json` to hide the folder, confirm that “docs” is not appearing as an extra entry.)
- Links between your docs pages keep the `/docs` prefix. (Try clicking links in your MDX content or sidebar – they should route within the docs section, not navigate to the wrong place.)
- The rest of your site’s pages (e.g. `/about` or the homepage) still work with their own layout, unaffected by the docs. If something in the docs setup is overriding other routes, double-check that you placed the catch-all inside `app/docs` folder (and not at the root of `app`). Also ensure no global basePath was set, since we want only the docs section to have the prefix.

## 8. Alternative Approaches and Frameworks

**Using a separate documentation framework (e.g. Docusaurus):** If for some reason Nextra’s integration doesn’t suit your needs, you can consider using a dedicated docs generator like [Docusaurus](https://docusaurus.io/). Docusaurus is a React-based static site generator specifically for documentation, which comes with a lot of out-of-the-box features (versioning, translations, search, theming plugins, etc.). In fact, Docusaurus’s own docs note that it has more built-in features than Nextra for large documentation projects ([Introduction | Docusaurus](https://docusaurus.io/docs/next#:~:text=Nextra%20is%20an%20opinionated%20static,currently%20less%20featured%20than%20Docusaurus)). One comparison suggests that for a simple standalone docs site without needing Next.js features, Docusaurus might be a better choice, whereas Nextra shines when you want to integrate docs into a Next.js app or need more customization via React/Next ([Comparisons | Fumadocs](https://fumadocs.vercel.app/docs/ui/comparisons#:~:text=Better%20DX)).

However, using Docusaurus in an existing Next.js **monorepo** or site would typically mean running it as a separate app. For example, you could host Docusaurus on a subpath by building it as a static site and serving it from the `/docs` folder of your main website (or via a reverse proxy configuration). This can be done, but introduces complexity (you’d essentially maintain two builds/apps). If you only need a basic docs section, Nextra (or similar Next.js-based solutions) will likely be simpler since you can keep everything in one Next.js project.

**Older Nextra versions or other solutions:** Before Nextra supported the App Router, some projects achieved a `/docs` section by mixing Next’s Pages and App routers (putting the docs MDX pages in a `pages/docs` directory and the rest in `app/`) ([Inject Nextra documentation in existing NextJs 13 project with app feature · shuding nextra · Discussion #1142 · GitHub](https://github.com/shuding/nextra/discussions/1142#:~:text=Nextra%20doesn%27t%20support%20the%20app,need%20to%20create%20a%20monorepo)). This is no longer necessary with Nextra 4, but it’s good to know it was possible. There are also other Next.js-based documentation kits (like Fumadocs, Mintlify, etc.), but their setups are beyond this scope. The approach described above is the officially recommended way with Nextra 4 and should cover most needs.

## 9. Real-World Examples

Many projects have successfully implemented a docs section on their site using Nextra or similar methods. For instance, Vercel’s own open-source projects use Nextra for documentation. The Next.js website’s documentation (accessible at nextjs.org/docs) is built with Nextra, as are others like the SWR and Turborepo docs ([Create Docs like vercel's : r/nextjs](https://www.reddit.com/r/nextjs/comments/14tq06q/create_docs_like_vercels/#:~:text=%E2%80%A2)). These are essentially separate documentation sections that live under a subpath (or subdomain) but provide a seamless experience.

Another example is a developer who shared their Next.js 14 app structure, where the main site pages and the `/docs` pages coexisted. They used Nextra to power the `/docs` routes and confirmed that the integration “got everything working under a subpath `/docs`” of their site ([Cannot import react in mdx files · Issue #4096 · shuding/nextra · GitHub](https://github.com/shuding/nextra/issues/4096#:~:text=I%27m%20migrating%20from%20v3%20to,Here%20is%20the%20build%20log)). In that case, the main site’s pages remained unaffected, and the docs section had its own navigation and layout.

If you need inspiration or confirmation, check out Nextra’s official examples and showcase. Nextra’s documentation itself (what you’re reading on Nextra’s site) is a Nextra app with an App Router setup. The configuration we walked through is informed by the official Nextra example and documentation ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=next)) ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=your%20)), so it’s a proven approach.

---

By following the steps above, you should have a fully functional docs section at `/docs` that leverages Nextra’s documentation features, without impacting the rest of your Next.js application. You get the best of both: a nice documentation UI for your docs, and full control over your main site’s pages. Good luck with your documentation setup!

**Sources:**

- Nextra Documentation – _Content Directory & App Router Setup_ ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=next)) ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=import%20,components))
- Nextra Documentation – _Catch-all Route Example for App Router_ ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=import%20,components)) ([content Directory | Nextra](https://nextra.site/docs/file-conventions/content-directory#:~:text=const%20Wrapper%20%3D%20getMDXComponents%28%29))
- Nextra GitHub Issue – _Discussion on integrating Nextra docs in an existing Next.js app_ ([Cannot import react in mdx files · Issue #4096 · shuding/nextra · GitHub](https://github.com/shuding/nextra/issues/4096#:~:text=app%20%E2%94%9C%E2%94%80%E2%94%80%20,tsx%20%E2%94%82%C2%A0%C2%A0%20%E2%94%9C%E2%94%80%E2%94%80%20pricing)) ([Cannot import react in mdx files · Issue #4096 · shuding/nextra · GitHub](https://github.com/shuding/nextra/issues/4096#:~:text=%E2%94%82%C2%A0%C2%A0%20%E2%94%94%E2%94%80%E2%94%80%20terms,mdxPath))
- Medium Tutorial – _Injecting Nextra docs at `/docs` and using `_meta` to hide the docs folder_ ([Integrating Nextra Documentation into NextJS 14: A Quick Tutorial | by Adijsad | Level Up Coding](https://levelup.gitconnected.com/integrating-nextra-documentation-into-nextjs-14-a-quick-tutorial-28a99ff7f7a4#:~:text=%7B%20,)) ([Integrating Nextra Documentation into NextJS 14: A Quick Tutorial | by Adijsad | Level Up Coding](https://levelup.gitconnected.com/integrating-nextra-documentation-into-nextjs-14-a-quick-tutorial-28a99ff7f7a4#:~:text=This%20hides%20displaying%20,com%2Fshuding%2Fnextra%2Fissues%2F291))
- Reddit Discussion – _Vercel’s open source docs (Next.js, SWR, etc.) are built with Nextra_ ([Create Docs like vercel's : r/nextjs](https://www.reddit.com/r/nextjs/comments/14tq06q/create_docs_like_vercels/#:~:text=%E2%80%A2))
- Fumadocs Guide – _Notes on when Docusaurus might be a better choice vs. Next.js-based docs_