"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
import { sections } from "@/data/articles";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="utility-bar">
        <div className="shell utility-inner">
          <span>Thursday, 27 August 2026</span>
          <div className="utility-links">
            <Link href="/about">About</Link>
            <Link href="/newsletter">Newsletter</Link>
            <Link href="/admin">Write for EveryGyan</Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="shell header-main">
          <button
            className="icon-button mobile-menu-button"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link className="brand" href="/" aria-label="EveryGyan home">
            <Image src="/everygyan-logo.png" alt="EveryGyan" width={318} height={115} priority />
          </Link>

          <nav className={`primary-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
            <Link href="/#latest" onClick={() => setMenuOpen(false)}>Latest</Link>
            {sections.map((section) => (
              <Link key={section.name} href={`/#${section.name.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                {section.name}
                <ChevronDown size={14} aria-hidden="true" />
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <select className="language-select" aria-label="Choose language" defaultValue="en">
              <option value="en">EN</option>
              <option value="de">DE</option>
              <option value="hi">HI</option>
              <option value="es">ES</option>
            </select>
            <ThemeToggle />
            <button
              className="icon-button"
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search EveryGyan"
            >
              <Search size={20} />
            </button>
            <Link className="sign-in" href="/login">
              <UserRound size={18} />
              <span>Sign in</span>
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="search-panel">
            <form className="shell search-form" action="/search">
              <Search size={21} />
              <input name="q" type="search" autoFocus placeholder="Search news, guides, reviews and learning..." />
              <button className="button button-primary" type="submit">Search</button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}

