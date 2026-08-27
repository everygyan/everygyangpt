import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Image src="/everygyan-logo.png" alt="EveryGyan" width={260} height={94} />
          <p>Explore the world. Understand what matters. Learn something every day.</p>
          <div className="social-links">
            <a href="#" aria-label="EveryGyan on Instagram"><Instagram size={19} /></a>
            <a href="#" aria-label="EveryGyan on YouTube"><Youtube size={19} /></a>
            <a href="#" aria-label="EveryGyan on Facebook"><Facebook size={19} /></a>
            <a href="#" aria-label="EveryGyan on LinkedIn"><Linkedin size={19} /></a>
          </div>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#news">News</Link>
          <Link href="/#travel">Travel</Link>
          <Link href="/#entertainment">Entertainment</Link>
          <Link href="/#health">Health</Link>
          <Link href="/#learn">Learn</Link>
        </div>
        <div>
          <h3>EveryGyan</h3>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/editorial-policy">Editorial policy</Link>
          <Link href="/corrections">Corrections</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookie settings</Link>
          <Link href="/accessibility">Accessibility</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 EveryGyan. All rights reserved.</span>
        <span>Independent knowledge for curious minds.</span>
      </div>
    </footer>
  );
}

