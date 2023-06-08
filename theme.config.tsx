import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <div>
      <img src="/logo.png" style={{height: "3rem" }}/>
    </div>
  ),
  darkMode: true,
  primaryHue: 200,
  project: {
    link: 'https://github.com/fuzehq',
  },
  docsRepositoryBase: 'https://github.com/fuzehq/documentation',
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Fuze Documentation" />
      <meta property="og:description" content="API documentation for Fuze" />
      <meta property="og:image" content="https://fuze.finance/logo.png" />
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
