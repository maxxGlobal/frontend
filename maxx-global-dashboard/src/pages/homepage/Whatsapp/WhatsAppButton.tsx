import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/+905079164273"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-green-500 text-white
        shadow-lg hover:bg-green-600
        transition-colors
      "
    >
      <FaWhatsapp className="w-7 h-7" />
    </a>
  );
}
