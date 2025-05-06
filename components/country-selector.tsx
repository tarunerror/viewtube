"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "BR", name: "Brazil" },
  { code: "RU", name: "Russia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "CA", name: "Canada" },
]

interface CountrySelectorProps {
  selectedCountry: string
  onCountryChange: (country: string) => void
}

export function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  const selectedCountryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || "Select Country"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <Globe className="mr-2 h-4 w-4" />
          {selectedCountryName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {COUNTRIES.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => onCountryChange(country.code)}
            className={selectedCountry === country.code ? "bg-accent" : ""}
          >
            {country.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
