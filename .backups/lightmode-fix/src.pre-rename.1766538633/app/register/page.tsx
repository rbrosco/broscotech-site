"use client";
import Header from "../../component/Header";
import Chatbot from "../../component/ChatBot";
import Register from "../../component/register";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <motion.main
        className="min-h-screen pt-[var(--header-height)] scroll-mt-[calc(var(--header-height)+1rem)] flex items-center justify-center px-4 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <Register />
      </motion.main>
      <Chatbot />
    </>
  );
}
