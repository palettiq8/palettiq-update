import Link from "next/link";

export default function page() {
  return (
    <div className="w-full h-screen grid place-content-center">
      <Link
        href={"/projects"}
        className="px-4 py-2 rounded-md bg-indigo-500 text-md font-semibold text-white"
      >
        Projects
      </Link>
    </div>
  );
}
