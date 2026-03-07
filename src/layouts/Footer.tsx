import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import esebillsLogo from '../assets/esebills_logo.png';
import { ROUTE_PATHS } from '../router/paths';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <img src={esebillsLogo} alt="EseBills" className="h-10 w-auto brightness-0 invert mb-6 opacity-90" />
            <p className="text-slate-400 text-sm leading-relaxed">
              The ultimate destination for all your bill payments. Reliable, secure and lightning fast.
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Quick Links</h5>
            <ul className="space-y-2">
              {['About Us', 'Our Services', 'Terms & Conditions', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Help Center</h5>
            <ul className="space-y-2">
              {['FAQs', 'Support Ticket', 'Payment Guide'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">Contact Us</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail size={14} className="text-emerald-500 shrink-0" />
                info@esebills.com
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone size={14} className="text-emerald-500 shrink-0" />
                +263 123 456 789
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin size={14} className="text-emerald-500 shrink-0" />
                Harare, Zimbabwe
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} EseBills. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to={ROUTE_PATHS.login} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Customer Login
            </Link>
            <Link to={ROUTE_PATHS.loginAgent} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Agent Portal
            </Link>
            <Link to={ROUTE_PATHS.loginBiller} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Biller Portal
            </Link>
            <Link to={ROUTE_PATHS.register} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
