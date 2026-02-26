import React from 'react';

const PrivacyPolicy = () => {
  const sections = [
    { id: 'definitions', title: 'Definitions' },
    { id: 'collection', title: 'Collecting Data' },
    { id: 'tracking', title: 'Tracking & Cookies' },
    { id: 'use-of-data', title: 'Use of Your Data' },
    { id: 'sharing', title: 'Sharing Data' },
    { id: 'retention', title: 'Retention' },
    { id: 'transfer', title: 'Transfer of Data' },
    { id: 'deletion', title: 'Delete Your Data' },
    { id: 'disclosure', title: 'Disclosure' },
    { id: 'children', title: 'Children’s Privacy' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        
        {/* Header Section */}
        <header className="bg-slate-900 p-8 text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-slate-400">Last updated: February 17, 2026</p>
        </header>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Nav */}
          <nav className="lg:w-1/4 bg-slate-50 p-6 border-b lg:border-r border-gray-200">
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-4 tracking-widest">Navigation</h3>
            <ul className="space-y-3 sticky top-6">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content Area */}
          <main className="lg:w-3/4 p-8 md:p-12 text-slate-700 leading-relaxed overflow-y-auto">
            
            <section className="mb-12">
              <p className="italic text-slate-500 mb-4">
                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information and tells You about Your privacy rights.
              </p>
              <p>We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
            </section>

            {/* Definitions */}
            <section id="definitions" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Interpretation and Definitions</h2>
              <h3 className="text-lg font-semibold mb-3">Definitions</h3>
              <ul className="space-y-4 text-sm">
                <li><strong>Account:</strong> A unique account created for You to access our Service.</li>
                <li><strong>Company:</strong> Bluestone Group of Institutions, 2nd floor, Renaissance Terrace, 126L, Coimbatore, TN 641018.</li>
                <li><strong>Personal Data:</strong> Any information that relates to an identified or identifiable individual.</li>
                <li><strong>Service:</strong> Refers to the Website.</li>
              </ul>
            </section>

            {/* Collecting and Using Data */}
            <section id="collection" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Collecting and Using Your Personal Data</h2>
              <h3 className="font-bold mb-2">Types of Data Collected</h3>
              <div className="bg-slate-50 p-4 rounded mb-4">
                <p className="font-semibold text-blue-800 mb-2 underline">Personal Data:</p>
                <ul className="list-disc ml-5">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                </ul>
              </div>
              <p className="font-semibold text-blue-800 mb-2 underline">Usage Data:</p>
              <p className="text-sm">Collected automatically, including IP addresses, browser type, device unique IDs, and diagnostic data.</p>
            </section>

            {/* Cookies */}
            <section id="tracking" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Tracking Technologies and Cookies</h2>
              <p className="mb-4">We use Cookies and similar tracking technologies (beacons, tags, scripts) to analyze Our Service.</p>
              <div className="space-y-4">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-bold">Necessary / Essential Cookies</h4>
                  <p className="text-sm">Type: Session | Administered by: Us</p>
                  <p className="text-sm mt-1">Purpose: Essential for providing services and preventing fraudulent use of accounts.</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-bold">Functionality Cookies</h4>
                  <p className="text-sm">Type: Persistent | Administered by: Us</p>
                  <p className="text-sm mt-1">Purpose: Remembers choices like login details or language preferences.</p>
                </div>
              </div>
            </section>

            {/* Use of Data */}
            <section id="use-of-data" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Use of Your Personal Data</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <li className="bg-white border p-3 rounded shadow-sm"><strong>To maintain our Service:</strong> Monitor usage of our Service.</li>
                <li className="bg-white border p-3 rounded shadow-sm"><strong>To manage Your Account:</strong> Manage Your registration as a user.</li>
                <li className="bg-white border p-3 rounded shadow-sm"><strong>To contact You:</strong> Via email, calls, SMS, or push notifications.</li>
                <li className="bg-white border p-3 rounded shadow-sm"><strong>For marketing:</strong> News and offers similar to your inquiries.</li>
              </ul>
            </section>

            {/* Retention */}
            <section id="retention" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Retention of Your Personal Data</h2>
              <p className="text-sm mb-4">The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy.</p>
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <ul className="space-y-2 text-sm">
                  <li><strong>User Accounts:</strong> Duration of relationship + 24 months.</li>
                  <li><strong>Support Data:</strong> Up to 24 months from ticket closure.</li>
                  <li><strong>Usage Data & Server Logs:</strong> Up to 24 months for analytics and security.</li>
                </ul>
              </div>
            </section>

            {/* Transfer */}
            <section id="transfer" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Transfer of Your Personal Data</h2>
              <p className="text-sm italic">
                Your information may be transferred to and maintained on computers located outside of Your state or country where data protection laws may differ. Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
              </p>
            </section>

            {/* Delete/Contact */}
            <section id="deletion" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Delete Your Personal Data</h2>
              <p className="text-sm">You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. You may update or delete your information by signing in to Your Account or contacting us directly.</p>
            </section>

            <section id="disclosure" className="mb-12 border-t pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Disclosure of Your Personal Data</h2>
              <p className="text-sm">We may disclose data for business transactions, law enforcement, or to comply with legal obligations to protect the rights and safety of the Company and users.</p>
            </section>

            <footer className="mt-12 pt-8 border-t text-center">
              <p className="font-bold text-slate-900">Contact Us</p>
              <p className="text-blue-600 font-medium">info@bluestonegroupofinstitutions.com</p>
              <p className="text-xs text-slate-400 mt-4">© 2026 Bluestone Group of Institutions. All rights reserved.</p>
            </footer>

          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;