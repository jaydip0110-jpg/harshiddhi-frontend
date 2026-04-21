import { Link } from "react-router-dom";
import {
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl text-white mb-1">Harshiddhi</h3>
          <p className="text-gold text-xs tracking-widest uppercase mb-4">
            Saree &amp; Dresses
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Celebrating the beauty of Indian ethnic wear with premium quality
            sarees, lehengas, and dresses.
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href="https://www.instagram.com/harsiddhisareekurti?igsh=NTc4MTIwNjQ2YQ=="
              className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
            >
              <FiInstagram size={16} />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
            >
              <FiFacebook size={16} />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
            >
              <FiYoutube size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {["Home", "Products", "Cart", "My Orders"].map((l) => (
              <li key={l}>
                <Link
                  to={`/${l === "Home" ? "" : l.toLowerCase().replace(" ", "")}`}
                  className="hover:text-primary transition-colors"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-4">Categories</h4>
          <ul className="space-y-2 text-sm">
            {[
              "Sarees",
              "Dresses",
              "Lehenga",
              "Suits",
              "Kurtis",
              "Dupattas",
            ].map((c) => (
              <li key={c}>
                <Link
                  to={`/products?category=${c}`}
                  className="hover:text-primary transition-colors"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0 text-primary" />
              <span>Ranpur, Gujarat, India</span>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="text-primary" />
              <span>+91 8905858891</span>
            </li>
            <li className="flex items-center gap-2">
              <FiMail className="text-primary" />
              <span>Harsiddhisaree32@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Harshiddhi Saree &amp; Dresses. All rights
        reserved. Made with ❤️ in India.
      </div>
    </footer>
  );
}
