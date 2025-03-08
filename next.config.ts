import type { NextConfig } from "next";
import nextra from "nextra";

const withNextra = nextra({
  contentDirBasePath: "/docs",
});

// Apply the Nextra middleware to Next.js config
export default withNextra({
  // Your Next.js config options
});
