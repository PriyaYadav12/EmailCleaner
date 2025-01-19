import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Digital Declutterer</h1>
      <p className="mb-4">
        The Digital Declutterer helps you manage and organize your digital life with ease. 
        Whether it's cleaning up your email inbox, we've got you covered.
      </p>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Email Cleaner</h2>
        <p>
          Our Email Cleaner tool allows you to quickly and efficiently clean up your email inbox. 
          You can delete unnecessary emails, organize important ones, and keep your inbox clutter-free.
          <br />
          <Link href="/emails" className="text-blue-500 hover:underline">
              Emails
            </Link>
        </p>
      </div>
    </div>
  );
}
