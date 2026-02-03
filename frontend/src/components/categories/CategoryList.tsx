import Link from 'next/link'
import { Category } from '@/types'

interface CategoryListProps {
  categories: Category[]
  activeSlug?: string
}

export default function CategoryList({ categories, activeSlug }: CategoryListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          !activeSlug
            ? 'bg-primary text-white'
            : 'bg-dark-card text-text-secondary hover:text-white hover:bg-dark-input border border-border'
        }`}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categoria/${category.slug}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSlug === category.slug
              ? 'text-white'
              : 'bg-dark-card text-text-secondary hover:text-white border border-border'
          }`}
          style={
            activeSlug === category.slug
              ? { backgroundColor: category.color }
              : { borderColor: `${category.color}40` }
          }
        >
          {category.name}
          {category.postCount !== undefined && (
            <span className="ml-2 text-xs opacity-70">({category.postCount})</span>
          )}
        </Link>
      ))}
    </div>
  )
}
