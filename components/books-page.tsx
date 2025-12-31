"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { BookOpen, Play, Search, Filter, Clock, Star } from "lucide-react"
import { toast } from "sonner"
import { Book } from "../lib/types"

interface BooksPageProps {
  onBookSelect: (book: Book) => void
  userTier: "free" | "premium"
}

export default function BooksPage({ onBookSelect, userTier }: BooksPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 9

  const genres = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Science Fiction",
    "Biography",
    "History",
    "Self-Help",
    "Business"
  ]

  const fetchBooks = async (pageNum: number, search: string, genre: string | null) => {
    try {
      setIsLoading(true)
      setError(null)
      
      let url = `/api/books?page=${pageNum}&limit=${ITEMS_PER_PAGE}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (genre) url += `&genre=${encodeURIComponent(genre)}`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch books')
      }

      setBooks(prevBooks => pageNum === 1 ? data.books : [...prevBooks, ...data.books])
      setHasMore(data.books.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching books:', error)
      setError(error instanceof Error ? error.message : 'Failed to load books')
      toast.error("Error loading books", {
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchBooks(1, searchTerm, selectedGenre)
  }, [searchTerm, selectedGenre])

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchBooks(nextPage, searchTerm, selectedGenre)
    }
  }

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(prev => prev === genre ? null : genre)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Audiobook Library</h1>
          <p className="text-gray-300 text-lg">Discover your next favorite audiobook from our curated collection</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search books, authors, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Genre Filters */}
        <div className="flex flex-wrap gap-2 mb-8 color-purple">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              className={`${
                selectedGenre === genre
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-white/10 text-gray-500 hover:black"
              }`}
              onClick={() => handleGenreSelect(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Books</h3>
            <p className="text-gray-400">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchBooks(1, searchTerm, selectedGenre)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="relative">
                    <div className="w-full h-48 bg-white/10 animate-pulse rounded-lg mb-4" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-white/10 animate-pulse rounded" />
                    <div className="h-4 bg-white/10 animate-pulse rounded w-2/3" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-4 bg-white/10 animate-pulse rounded mb-4" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-6 bg-white/10 animate-pulse rounded w-20" />
                    <div className="h-6 bg-white/10 animate-pulse rounded w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-white/10 animate-pulse rounded w-16" />
                    <div className="h-8 bg-white/10 animate-pulse rounded w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
                >
                  <CardHeader className="pb-4">
                    <div className="relative">
                      <img
                        src={book.cover_url || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <Button
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onBookSelect(book)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-white text-lg line-clamp-2">{book.title}</CardTitle>
                      <p className="text-gray-300 text-sm">by {book.author}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-400 mb-4 line-clamp-2">{book.description}</CardDescription>

                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {book.genre}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-300">{book.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{book.duration}</span>
                      </div>

                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => onBookSelect(book)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !isLoading && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="border-white/10 text-gray-300 hover:text-white"
                >
                  Load More
                </Button>
              </div>
            )}

            {/* Loading More Indicator */}
            {isLoading && page > 1 && (
              <div className="text-center mt-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            )}

            {books.length === 0 && !isLoading && !error && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
