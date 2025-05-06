"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, TrendingUp, Clock, ThumbsUp, Settings, Youtube } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { SearchInput } from "@/components/search-input"
import { AuthButton } from "@/components/auth-button"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"

export default function AppSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Trending", href: "/trending", icon: TrendingUp },
    { name: "Watch Later", href: "/watch-later", icon: Clock },
    { name: "Liked Videos", href: "/liked", icon: ThumbsUp },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <Sidebar className={`bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-r border-zinc-800 shadow-xl min-h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <SidebarHeader className="flex items-center px-4 py-4 shadow-sm">
        <Link href="/" className={`flex items-center gap-2 font-extrabold bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg transition-all duration-300 ${collapsed ? 'text-xl' : 'text-2xl'}`}> 
          <Youtube className={`text-red-500 drop-shadow-md transition-all duration-300 ${collapsed ? 'h-6 w-6' : 'h-7 w-7'}`} />
          {!collapsed && <span className="tracking-tight">ViewTube</span>}
        </Link>
        <button
          className="ml-auto p-1 rounded hover:bg-zinc-800 transition"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <div className="p-4 flex flex-col gap-4">
          {!collapsed && (
            <div className="bg-zinc-900/80 rounded-xl shadow-lg p-4 flex flex-col gap-4">
              <SearchInput />
              <AuthButton />
            </div>
          )}
        </div>

        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.name}
                className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-base
                  ${pathname === item.href ? 'bg-gradient-to-r from-red-500/20 to-orange-400/10 text-orange-300 border-l-4 border-orange-400 shadow-md' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-orange-200'}
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
              >
                <Link href={item.href} className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
                  <item.icon className={`h-5 w-5 transition-transform duration-200 ${pathname === item.href ? 'text-orange-400 scale-110' : 'group-hover:text-orange-300'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* User Profile & Theme Switcher */}
      <div className={`flex flex-col items-center ${collapsed ? 'px-2' : 'px-4'} pb-2 pt-4 gap-3 transition-all duration-300`}>
        {/* User Profile */}
        {status === 'authenticated' && session?.user ? (
          <div className={`flex items-center w-full ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <img src={session.user.image || ''} alt={session.user.name || 'User'} className="h-9 w-9 rounded-full border-2 border-orange-400 shadow" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-orange-200 leading-tight truncate max-w-[120px]">{session.user.name}</span>
                <span className="text-xs text-zinc-400 truncate max-w-[120px]">{session.user.email}</span>
              </div>
            )}
          </div>
        ) : null}
        {/* Theme Switcher */}
        <button
          className="mt-2 p-2 rounded-full bg-zinc-800 hover:bg-orange-400 transition-colors shadow"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-300" /> : <Moon className="h-5 w-5 text-zinc-700" />}
        </button>
      </div>

      <SidebarFooter className="px-4 pb-4 pt-2 mt-auto">
        <div className="border-t border-zinc-800 mb-2" />
        <p className="text-xs text-zinc-500 text-center tracking-wide">ViewTube &mdash; Ad-free YouTube Alternative</p>
      </SidebarFooter>
    </Sidebar>
  )
}
