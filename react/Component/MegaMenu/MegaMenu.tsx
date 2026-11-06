import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { useDevice } from 'vtex.device-detector'
import { useCssHandles } from 'vtex.css-handles'
import './MegaMenu.css'
import GET_CATEGORIES from '../../Graphql/categories.gql'

const CSS_HANDLES = [
  'megaMenuContainer',
  'megaMenuDesktopWrapper',
  'megaMenuMobileWrapper',
  'menuListDesktop',
  'menuItem',
  'menuItemTitle',
  'subMenuItemList',
  'subMenuItem',
  'menuLink',
  'mobileAccordionHeader',
  'mobileAccordionToggle',
  'moreMenuItem',
  'moreButton',
  'moreDropdown',
  'moreSubItem',
  'loadingState',
] as const

interface CategoryItem {
  id: number | string
  name: string
  href: string
  hasChildren?: boolean
  children?: CategoryItem[]
}

interface CategoriesQueryData {
  categories: CategoryItem[]
}

interface MegaMenuProps {
  desktopTitle?: string
  mobileTitle?: string
  treeLevel?: number
}

const VISIBLE_COUNT = 4

const MegaMenu: React.FC<MegaMenuProps> = ({
  desktopTitle = 'Departments',
  mobileTitle = 'Menu',
  treeLevel = 2,
}) => {
  const handles = useCssHandles(CSS_HANDLES)
  const { isMobile } = useDevice()

  const [activeItem, setActiveItem] = useState<number | null>(null)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(null)
  const moreMenuRef = useRef<HTMLLIElement | null>(null)

  const { data, loading, error } = useQuery<CategoriesQueryData>(GET_CATEGORIES, {
    variables: { treeLevel },
    fetchPolicy: 'cache-first',
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (loading) {
    return <div className={handles.loadingState} />
  }

  if (error || !data?.categories || data.categories.length === 0) {
    return null
  }

  const formatHref = (url: string) => {
    if (!url) return '#'
    try {
      const parsed = new URL(url)
      return parsed.pathname
    } catch {
      return url.startsWith('/') ? url : `/${url}`
    }
  }

  const categories = data.categories
  const visibleCategories = categories.slice(0, VISIBLE_COUNT)
  const overflowCategories = categories.slice(VISIBLE_COUNT)

  // ----------------- MOBILE VIEW -----------------
  if (isMobile) {
    return (
      <nav className={handles.megaMenuMobileWrapper} aria-label={mobileTitle}>
        {categories.map((dept, index) => {
          const isOpen = mobileOpenIndex === index
          const hasChildren = Boolean(dept.children && dept.children.length > 0)

          return (
            <div key={`dept-m-${dept.id}`} className={handles.menuItem}>
              <div
                className={handles.mobileAccordionHeader}
                onClick={() => setMobileOpenIndex(isOpen ? null : index)}
              >
                <a
                  href={formatHref(dept.href)}
                  className={handles.menuLink}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault()
                      setMobileOpenIndex(isOpen ? null : index)
                    }
                  }}
                >
                  {dept.name}
                </a>

                {hasChildren && (
                  <span className={handles.mobileAccordionToggle}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                )}
              </div>

              {isOpen && hasChildren && (
                <ul className={handles.subMenuItemList}>
                  {dept.children?.map((cat) => (
                    <li key={`cat-m-${cat.id}`} className={handles.subMenuItem}>
                      <a href={formatHref(cat.href)} className={handles.menuLink}>
                        {cat.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    )
  }

  // ----------------- DESKTOP VIEW -----------------
  return (
    <nav className={handles.megaMenuDesktopWrapper} aria-label={desktopTitle}>
      <ul className={handles.menuListDesktop}>
        {/* Main 4 items */}
        {visibleCategories.map((dept, index) => {
          const hasChildren = Boolean(dept.children && dept.children.length > 0)

          return (
            <li
              key={`dept-${dept.id}`}
              className={handles.menuItem}
              onMouseEnter={() => setActiveItem(index)}
              onMouseLeave={() => setActiveItem(null)}
            >
              <a href={formatHref(dept.href)} className={handles.menuItemTitle}>
                {dept.name}
              </a>

              {activeItem === index && hasChildren && (
                <ul className={handles.subMenuItemList}>
                  {dept.children?.map((cat) => (
                    <li key={`cat-${cat.id}`} className={handles.subMenuItem}>
                      <a href={formatHref(cat.href)} className={handles.menuLink}>
                        {cat.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}

        {/* Three dots overflow menu */}
        {overflowCategories.length > 0 && (
          <li ref={moreMenuRef} className={handles.moreMenuItem}>
            <button
              type="button"
              className={handles.moreButton}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              aria-label="More categories"
            >
              &bull;&bull;&bull;
            </button>

            {isMoreOpen && (
              <div className={handles.moreDropdown}>
                <ul>
                  {overflowCategories.map((dept) => (
                    <li key={`overflow-${dept.id}`} className={handles.moreSubItem}>
                      <a
                        href={formatHref(dept.href)}
                        className={handles.menuLink}
                        onClick={() => setIsMoreOpen(false)}
                      >
                        {dept.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  )
}

export default MegaMenu