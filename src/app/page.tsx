import Image from "next/image";
import { IoDocumentText } from "react-icons/io5";
import { FaBook } from "react-icons/fa";
import { MdOutlineNotes } from "react-icons/md";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
       <h1>ai-lab</h1>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/notes"
        >
          <MdOutlineNotes className="text-lg" />
          Notes
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/resources"
        >
          <FaBook className="text-lg" />
          Resources
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/posts"
        >
          <IoDocumentText className="text-lg" />
          Blog
        </a>
      </footer>
    </div>
  );
}
