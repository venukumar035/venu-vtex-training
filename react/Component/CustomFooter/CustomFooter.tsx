import React, { useState } from 'react'
import { useDevice } from 'vtex.device-detector'
import { useCssHandles } from 'vtex.css-handles'

const CSS_HANDLES = [
  'footerContainer',
  'footerDesktopWrapper',
  'footerMobileWrapper',
  'footerColumn',
  'footerColumnTitle',
  'footerLinkList',
  'footerLinkItem',
  'footerLink',
  'footerCopyright',
  'footerAccordionToggle'
] as const

interface FooterLink {
  title: string
  href: string
}

interface FooterSection {
  title: string
  links?: FooterLink[]
}

interface CustomFooterProps {
  copyrightText?: string
  sections?: FooterSection[]
}

interface StorefrontComponent<P = {}> extends React.FC<P> {
  schema?: Record<string, any>
}

const CustomFooter: StorefrontComponent<CustomFooterProps> = ({
  copyrightText = '© 2026 All rights reserved.',
  sections = []
}) => {
  const handles = useCssHandles(CSS_HANDLES)
  const { isMobile } = useDevice()
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({})

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({ ...prev, [index]: !prev[index] }))
  }

  // ----------------- MOBILE LAYOUT (Accordions) -----------------
  if (isMobile) {
    return (
      <footer className={handles.footerMobileWrapper} style={{ backgroundColor: '#111', color: '#fff', padding: '24px 16px' }}>
        {sections.map((section, idx) => {
          const isOpen = Boolean(openSections[idx])
          const hasLinks = Boolean(section.links && section.links.length > 0)

          return (
            <div key={`${section.title}-${idx}`} className={handles.footerColumn} style={{ borderBottom: '1px solid #333' }}>
              <div
                onClick={() => toggleSection(idx)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  cursor: 'pointer'
                }}
              >
                <span className={handles.footerColumnTitle} style={{ fontWeight: 600, fontSize: '15px' }}>
                  {section.title}
                </span>
                {hasLinks && (
                  <span className={handles.footerAccordionToggle} style={{ fontSize: '12px' }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                )}
              </div>

              {isOpen && hasLinks && (
                <ul className={handles.footerLinkList} style={{ listStyle: 'none', margin: 0, padding: '0 0 16px 8px' }}>
                  {section.links?.map((link, lIdx) => (
                    <li key={`${link.title}-${lIdx}`} className={handles.footerLinkItem} style={{ padding: '6px 0' }}>
                      <a
                        href={link.href}
                        className={handles.footerLink}
                        style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}

        <div className={handles.footerCopyright} style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#777' }}>
          {copyrightText}
        </div>
      </footer>
    )
  }

  // ----------------- DESKTOP LAYOUT (Columns) -----------------
  return (
    <footer className={handles.footerDesktopWrapper} style={{ backgroundColor: '#111', color: '#fff', padding: '48px 64px 24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '32px'
        }}
      >
        {sections.map((section, idx) => (
          <div key={`${section.title}-${idx}`} className={handles.footerColumn} style={{ minWidth: '160px' }}>
            <h4
              className={handles.footerColumnTitle}
              style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              {section.title}
            </h4>
            <ul className={handles.footerLinkList} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {section.links?.map((link, lIdx) => (
                <li key={`${link.title}-${lIdx}`} className={handles.footerLinkItem} style={{ padding: '6px 0' }}>
                  <a
                    href={link.href}
                    className={handles.footerLink}
                    style={{ color: '#bbb', textDecoration: 'none', fontSize: '14px' }}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className={handles.footerCopyright}
        style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #222',
          fontSize: '13px',
          color: '#777'
        }}
      >
        {copyrightText}
      </div>
    </footer>
  )
}

// ----------------- SITE EDITOR SCHEMA -----------------
CustomFooter.schema = {
  title: 'Custom Footer',
  description: 'Manage columns, links, and copyright for the storefront footer',
  type: 'object',
  properties: {
    copyrightText: {
      title: 'Copyright Text',
      type: 'string',
      default: '© 2026 All rights reserved.'
    },
    sections: {
      title: 'Footer Columns',
      type: 'array',
      items: {
        title: 'Column',
        type: 'object',
        properties: {
          title: {
            title: 'Column Title',
            type: 'string'
          },
          links: {
            title: 'Column Links',
            type: 'array',
            items: {
              title: 'Link',
              type: 'object',
              properties: {
                title: {
                  title: 'Label',
                  type: 'string'
                },
                href: {
                  title: 'URL',
                  type: 'string',
                  default: '/'
                }
              }
            }
          }
        }
      }
    }
  }
}

export default CustomFooter