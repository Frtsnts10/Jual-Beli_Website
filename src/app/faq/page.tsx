"use client";



export default function FAQPage() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 px-6 py-32 max-w-3xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-neutral-400 text-lg">
            Everything you need to know about our services.
          </p>
        </div>

        <div className="bg-neutral-950/50 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <details className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-lg text-white hover:bg-neutral-800/50 transition-colors">
                How fast is delivery?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-neutral-400 text-sm">
                Delivery is fully automated and instant. As soon as your payment is confirmed, your account credentials will be displayed on the screen and emailed to you immediately.
              </div>
            </details>

            <details className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-lg text-white hover:bg-neutral-800/50 transition-colors">
                Are these accounts legitimate?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-neutral-400 text-sm">
                Yes. We manage private family and master accounts, legally distributing profiles across our user base to reduce costs while maintaining high quality service.
              </div>
            </details>

            <details className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-lg text-white hover:bg-neutral-800/50 transition-colors">
                What if I face an issue with my account?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-neutral-400 text-sm">
                We offer a full warranty for the duration of your subscription. If you ever experience a screen limit or password issue, our 24/7 support will replace or fix the account immediately.
              </div>
            </details>

            <details className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-lg text-white hover:bg-neutral-800/50 transition-colors">
                Am I allowed to share my profile with friends?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-neutral-400 text-sm">
                Unless you purchase a "Private" or "Family" tier, sharing your individual profile is strictly prohibited. Doing so may trigger automated security blocks on the account.
              </div>
            </details>

            <details className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-lg text-white hover:bg-neutral-800/50 transition-colors">
                What payment methods do you accept?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="p-4 pt-0 text-neutral-400 text-sm">
                We accept all major local payment methods including QRIS, Virtual Accounts, e-Wallets (GoPay, OVO, Dana), and Credit Cards via our secure payment gateway.
              </div>
            </details>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-12 text-center text-neutral-500 text-sm mt-12 bg-neutral-950">
        <p>&copy; {new Date().getFullYear()} STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
