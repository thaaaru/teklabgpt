import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { label: 'About', href: '#about' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Contact', href: '#contact' },
    { label: 'TekLab.dev', href: 'https://teklab.dev' },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="mt-24 border-t border-white/[0.08]">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-semibold text-gradient">TekLab AI</span>
            </div>
            <p className="text-sm text-dark-muted text-center md:text-left">
              Advanced AI-powered cybersecurity intelligence platform
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center space-x-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-dark-muted hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center space-x-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors group"
                >
                  <Icon className="w-5 h-5 text-dark-muted group-hover:text-primary transition-colors" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
          <p className="text-xs text-dark-muted">
            © {new Date().getFullYear()} TekLab AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
