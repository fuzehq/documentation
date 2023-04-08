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
  footer: {
    text: 'Fuze',
  },
}

export default config
