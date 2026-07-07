import { Github, Linkedin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { footerLinkGroups } from '../../config/navigation';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="public-footer" aria-label="SentriX footer">
      <div className="public-footer-inner">
        <div className="public-footer-brand-column">
          <BrandLogo showProductTag className="public-footer-brand" />
          <p className="public-footer-description">
            AI-powered threat intelligence platform for OSINT reconnaissance and multi-agent vulnerability diagnostics.
          </p>
        </div>

        <div className="public-footer-links-grid">
          {footerLinkGroups.map((group) => (
            <div key={group.label} className="public-footer-column">
              <div className="public-footer-column-label">{group.label}</div>
              <div className="public-footer-link-list">
                {group.links.map((link) => (
                  link.type === 'route' ? (
                    <Link key={link.label} to={link.href} className="public-footer-link">
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href} className="public-footer-link">
                      {link.label}
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="public-footer-meta-column">
          <div className="public-footer-socials" aria-label="Social presence">
            <a 
              href="https://github.com/vaaiiibbhav" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="public-footer-icon-button" 
              aria-label="SentriX GitHub presence"
            >
              <Github size={16} />
            </a>
            <a 
              href="https://www.linkedin.com/in/vaibhav-verma-905a1b270/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="public-footer-icon-button" 
              aria-label="SentriX LinkedIn presence"
            >
              <Linkedin size={16} />
            </a>
          </div>

          <div className="public-footer-badges">
            <div className="public-footer-badge genw">
              <ShieldCheck size={14} />
              <span>Built with OmniAgent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="public-footer-bottom">© 2026 SentriX — Vaibhav Verma</div>
    </footer>
  );
}