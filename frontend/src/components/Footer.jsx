import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { IoFastFoodSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#ff4d2d] p-2 rounded-lg text-white">
                <IoFastFoodSharp size={24} />
              </div>
              <span className="text-2xl font-black text-gray-800 tracking-tighter">
                Bean<span className="text-[#ff4d2d]">Verse</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Delivering happiness to your doorstep, one meal at a time. The best food from top-rated local restaurants.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<FaFacebookF />} />
              <SocialIcon icon={<FaInstagram />} />
              <SocialIcon icon={<FaTwitter />} />
              <SocialIcon icon={<FaYoutube />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li className="hover:text-[#ff4d2d] cursor-pointer transition"><Link to={"/about-us"}>About Us</Link></li>
              <li className="hover:text-[#ff4d2d] cursor-pointer transition">Team</li>
              <li className="hover:text-[#ff4d2d] cursor-pointer transition">Careers</li>
              <li className="hover:text-[#ff4d2d] cursor-pointer transition">Blog</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li className="hover:text-[#ff4d2d] cursor-pointer transition">Help & Support</li>
              <li className="hover:text-[#ff4d2d] cursor-pointer transition">Partner with us</li>
              <li className="hover:text-[#ff4d2d] cursor-pointer transition">Ride with us</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Keep in Touch</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe to get special offers and news.</p>
            <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent flex-1 px-3 text-sm focus:outline-none w-full"
              />
              <button className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#e64526] transition">
                JOIN
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">
          <p>© {currentYear} BEANVERSE TECHNOLOGY PVT. LTD.</p>
          <div className="flex gap-8">
            <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Social Icon Helper Component
const SocialIcon = ({ icon }) => (
  <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#ff4d2d] hover:text-white transition-all cursor-pointer border border-gray-100 shadow-sm">
    {icon}
  </div>
);

export default Footer;