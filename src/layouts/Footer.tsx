import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import esebillsLogo from "../assets/esebills_logo.png";
import { ROUTE_PATHS } from "../router/paths";

export function Footer() {
  return (
    <footer className="bg-[#10B981] border-t border-[#10B981] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <img
              src={esebillsLogo}
              alt="EseBills"
              className="h-24 w-auto mb-6 opacity-90 brightness-0 invert"
            />
            <p className="text-white/90 text-sm leading-relaxed">
              The ultimate destination for all your bill payments. Reliable,
              secure and lightning fast.
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2">
              {[
                "About Us",
                "Our Services",
                "Terms & Conditions",
                "Privacy Policy",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/85 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">
              Help Center
            </h5>
            <ul className="space-y-2">
              {["FAQs", "Support Ticket", "Payment Guide"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/85 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-4">
              Contact Us
            </h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/85 text-sm">
                <Mail size={14} className="text-white shrink-0" />
                info@esebills.com
              </li>
              <li className="flex items-center gap-2 text-white/85 text-sm">
                <Phone size={14} className="text-white shrink-0" />
                +263 123 456 789
              </li>
              <li className="flex items-center gap-2 text-white/85 text-sm">
                <MapPin size={14} className="text-white shrink-0" />
                Harare, Zimbabwe
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/80 text-xs">
            Â© {new Date().getFullYear()} EseBills. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link
              to={ROUTE_PATHS.login}
              className="text-white/85 hover:text-white text-sm transition-colors"
            >
              Customer Login
            </Link>
            <Link
              to={ROUTE_PATHS.loginAgent}
              className="text-white/85 hover:text-white text-sm transition-colors"
            >
              Agent Portal
            </Link>
            <Link
              to={ROUTE_PATHS.loginBiller}
              className="text-white/85 hover:text-white text-sm transition-colors"
            >
              Biller Portal
            </Link>
            <Link
              to={ROUTE_PATHS.register}
              className="text-white/85 hover:text-white text-sm transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
