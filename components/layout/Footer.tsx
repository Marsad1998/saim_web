"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, Briefcase, Hash, ShieldCheck } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-ots-dark text-white pt-16 pb-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Company Profile (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex items-center">
                <span className="text-2xl font-black text-ots-yellow tracking-wider">OTS</span>
                <span className="text-2xl font-bold text-white tracking-tight ml-1">TAXI</span>
              </div>
            </Link>
            
            <p className="text-xs text-ots-mutedText leading-relaxed">
              &quot;OTS Taxi&quot; is a registered trademark of OTS Taxi Limited, trademark number UK00004079557.
            </p>
            <p className="text-xs text-ots-mutedText">
              Online Travel Services <span className="block text-neutral-400 font-semibold mt-1">© 2026 - OtsTaxi.com All Rights Reserved</span>
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-300 pt-2">
              <li className="flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 text-ots-yellow mt-0.5 flex-shrink-0" />
                <span><strong className="text-neutral-400">Company Name:</strong> OTS Taxi Limited</span>
              </li>
              <li className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-ots-yellow mt-0.5 flex-shrink-0" />
                <span><strong className="text-neutral-400">Company Registration Number:</strong> 06783060</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-ots-yellow mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-neutral-400">Phone Number:</strong>{" "}
                  <a href="tel:+443330047131" className="hover:text-ots-yellow transition">+443330047131</a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-ots-yellow mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-neutral-400">Email:</strong>{" "}
                  <a href="mailto:support@otstaxi.com" className="hover:text-ots-yellow transition">support@otstaxi.com</a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-ots-yellow mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-neutral-400">Address:</strong> 167-169 Great Portland Street, 5th Floor, London W1W 5PF, United Kingdom
                </span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.facebook.com/otstaxicom/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-ots-yellow hover:text-black flex items-center justify-center text-xs transition font-bold"
                title="Facebook"
              >
                f
              </a>
              <a
                href="https://x.com/ots_taxi"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-ots-yellow hover:text-black flex items-center justify-center text-xs transition font-bold"
                title="X / Twitter"
              >
                𝕏
              </a>
              <a
                href="https://www.linkedin.com/company/ots-taxi"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-ots-yellow hover:text-black flex items-center justify-center text-xs transition font-bold"
                title="LinkedIn"
              >
                in
              </a>
            </div>
          </div>

          {/* Column 2: Company Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wider border-b-2 border-ots-yellow pb-2 inline-block">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-ots-mutedText">
              <li>
                <Link href="/about-us" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Partners
                </Link>
              </li>
              <li>
                <Link href="/airports" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> All Airports
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Airports (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wider border-b-2 border-ots-yellow pb-2 inline-block">
              Popular Airports
            </h4>
            <ul className="space-y-2 text-xs text-ots-mutedText">
              <li>
                <Link href="/airport/lhr" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> London Heathrow Airport (LHR)
                </Link>
              </li>
              <li>
                <Link href="/airport/lgw" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> London Gatwick Airport (LGW)
                </Link>
              </li>
              <li>
                <Link href="/airport/stn" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> London Stansted Airport (STN)
                </Link>
              </li>
              <li>
                <Link href="/airport/ltn" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> London Luton Airport (LTN)
                </Link>
              </li>
              <li>
                <Link href="/airport/man" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Manchester Airport (MAN)
                </Link>
              </li>
              <li>
                <Link href="/airport/edi" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Edinburgh Airport (EDI)
                </Link>
              </li>
              <li>
                <Link href="/airport/bhx" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Birmingham Airport (BHX)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wider border-b-2 border-ots-yellow pb-2 inline-block">
              Legal
            </h4>
            <ul className="space-y-2 text-xs text-ots-mutedText">
              <li>
                <Link href="/terms" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/gdpr-statement" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> GDPR Statement
                </Link>
              </li>
              <li>
                <Link href="/data-processing-agreement" className="hover:text-ots-yellow transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span> Data Processing Agreement
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom: Payment Gateways & Guarantee */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="font-semibold text-white">Accepted Payments:</span>
            <span className="px-2.5 py-1 bg-neutral-800 rounded font-semibold text-white">Stripe</span>
            <span className="px-2.5 py-1 bg-neutral-800 rounded font-semibold text-white">Visa</span>
            <span className="px-2.5 py-1 bg-neutral-800 rounded font-semibold text-white">Mastercard</span>
            <span className="px-2.5 py-1 bg-neutral-800 rounded font-semibold text-white">Maestro</span>
            <span className="px-2.5 py-1 bg-neutral-800 rounded font-semibold text-white">PayPal</span>
            <span className="px-2.5 py-1 bg-neutral-800 rounded font-semibold text-white">Apple Pay</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-ots-green" />
            <span>100% Secured 256-bit SSL Payments</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
