import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <div>
      <img src="/logo.png" style={{height: "3rem" }}/>
    </div>
  ),
  darkMode: true,
  primaryHue: 272,
  project: {
    link: 'https://github.com/fuzehq',
  },
  docsRepositoryBase: 'https://github.com/fuzehq/documentation',
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Fuze" />
      <meta property="og:description" content="Documentation site for Fuze" />
    </>
  ),
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Fuze'
    }
  },
  footer: {
    text: 'Fuze',
  },
}

export default config
