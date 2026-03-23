import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Services', path: '/catalog' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Proxy Tools', path: '/catalog?category=proxy_tools' },
    { label: 'Virtual Numbers', path: '/catalog?category=virtual_numbers' },
  ],
  Support: [
    { label: 'Help Center', path: '/support' },
    { label: 'Contact', path: '/support' },
    { label: 'Dating Guide', path: '/guides/dating' },
    { label: 'Sign In', path: '/auth' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">ToolStack</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional tools and services for businesses and creators worldwide.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ToolStack. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Trusted by 12,000+ professionals worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}