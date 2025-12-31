"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Headphones, Menu, X, Crown, User } from "lucide-react"

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
  isLoggedIn: boolean
  userTier: "free" | "premium"
  onLogout: () => void
}

export default function Navigation({ currentPage, onNavigate, isLoggedIn, userTier, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Home", key: "home" },
    { name: "Books", key: "books" },
    { name: "Audiomarks", key: "audiomarks" },
    { name: "Request a Book", key: "request-book" },
    { name: "About Us", key: "about" },
  ]

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AURIS</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.key ? "text-purple-400" : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => onNavigate("login")}>
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => onNavigate("register")}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant={userTier === "premium" ? "default" : "secondary"} className="flex items-center gap-1">
                  {userTier === "premium" && <Crown className="w-3 h-3" />}
                  {userTier === "premium" ? "Premium" : "Free"}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate(item.key)
                    setMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.key
                      ? "text-purple-400 bg-purple-400/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {!isLoggedIn ? (
                <div className="pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white"
                    onClick={() => {
                      onNavigate("login")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={() => {
                      onNavigate("register")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="pt-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-gray-300">Account</span>
                    <Badge variant={userTier === "premium" ? "default" : "secondary"}>
                      {userTier === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white"
                    onClick={() => {
                      onLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
